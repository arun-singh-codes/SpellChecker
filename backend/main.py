import base64, io, re
from collections import Counter
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from hash_table import HashTable
from search import lower_bound, suggest

app = FastAPI(title="Dictionary / Spell Checker")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

ht = HashTable()
words = []          # sorted list used for binary search


def load():
    raw = Path(__file__).with_name("words.txt").read_text().split()
    for w in sorted(set(x.lower() for x in raw if x.isalpha())):
        ht.insert(w)
        words.append(w)


load()


class Text(BaseModel):
    text: str


class Word(BaseModel):
    word: str


def chart(top):
    if not top:
        return None
    fig, ax = plt.subplots(figsize=(7, 3.4))
    sns.barplot(x=[w for w, _ in top], y=[c for _, c in top], color="#2f4a7a", ax=ax)
    ax.set_xlabel("Word"); ax.set_ylabel("Count"); ax.set_title("Word frequency")
    plt.xticks(rotation=35, ha="right"); plt.tight_layout()
    buf = io.BytesIO(); fig.savefig(buf, format="png", dpi=110); plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode()


@app.post("/check")
def check(body: Text):
    tokens = re.findall(r"[a-z']+", body.text.lower())
    tokens = [t.strip("'") for t in tokens if t.strip("'")]
    wrong = {}
    for t in set(tokens):
        if not ht.search(t):
            wrong[t] = suggest(words, t)
    top = Counter(tokens).most_common(10)
    return {"wrong": wrong, "freq": top, "chart": chart(top), "total": len(tokens)}


@app.post("/add-word")
def add_word(body: Word):
    w = body.word.strip().lower()
    if not w.isalpha():
        return {"success": False, "message": "Use letters only."}
    if not ht.insert(w):
        return {"success": False, "message": "Word already exists."}
    words.insert(lower_bound(words, w), w)      # keep sorted list in order
    return {"success": True, "message": f'Added "{w}".'}


@app.get("/stats")
def stats():
    return ht.stats()
