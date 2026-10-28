def lower_bound(arr, target):
    """Binary search: first index whose value >= target. O(log n)."""
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def suggest(sorted_words, word, k=5):
    """Shrink the prefix until binary search finds matching words."""
    for plen in range(len(word), 0, -1):
        prefix = word[:plen]
        i = lower_bound(sorted_words, prefix)
        res = []
        while i < len(sorted_words) and sorted_words[i].startswith(prefix) and len(res) < k:
            res.append(sorted_words[i])
            i += 1
        if res:
            return res
    return []
