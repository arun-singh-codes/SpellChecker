# Dictionary / Spell Checker (DAA Mini Project)

Hash table (chaining + linked list) for lookup, binary search for suggestions, seaborn word-frequency chart.

## Run backend
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload        # http://localhost:8000/docs

## Run frontend
    cd frontend
    npm install
    npm run dev                      # http://localhost:5173

## Complexity
- Hash insert/search: O(L) average, O(n) worst (all words collide)
- Binary search for suggestions: O(L log n), plus O(k) to collect k words
- Space: O(n)
