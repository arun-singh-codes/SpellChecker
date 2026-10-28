class Node:
    """Linked-list node used for chaining inside each bucket."""
    def __init__(self, word):
        self.word = word
        self.next = None


class HashTable:
    """Hash table with separate chaining (custom, no dict/set used)."""
    def __init__(self, size=4099):
        self.size = size
        self.table = [None] * size
        self.count = 0

    def _hash(self, word):                      # polynomial rolling hash
        h = 0
        for ch in word:
            h = (h * 31 + ord(ch)) % self.size
        return h

    def insert(self, word):
        idx = self._hash(word)
        cur = self.table[idx]
        while cur:
            if cur.word == word:
                return False                    # duplicate
            cur = cur.next
        node = Node(word)
        node.next = self.table[idx]             # insert at head: O(1)
        self.table[idx] = node
        self.count += 1
        return True

    def search(self, word):
        cur = self.table[self._hash(word)]
        while cur:
            if cur.word == word:
                return True
            cur = cur.next
        return False

    def stats(self):
        longest, used = 0, 0
        for head in self.table:
            n = 0
            while head:
                n += 1
                head = head.next
            if n:
                used += 1
            longest = max(longest, n)
        return {"words": self.count, "buckets": self.size,
                "used_buckets": used, "load_factor": round(self.count / self.size, 3),
                "longest_chain": longest}
