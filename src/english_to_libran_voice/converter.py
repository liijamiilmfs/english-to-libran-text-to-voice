"""Utilities to translate English text into the fictional Libran language."""
from __future__ import annotations

import re
from typing import Dict, Iterable, List

_TOKEN_RE = re.compile(r"[A-Za-z0-9']+|[^A-Za-z0-9']")

DEFAULT_DICTIONARY: Dict[str, str] = {
    "hello": "valori",
    "world": "zenith",
    "language": "oratil",
    "voice": "sonari",
    "story": "mythra",
    "friend": "kaleth",
    "journey": "sereth",
    "star": "lyr",
    "light": "phora",
    "shadow": "umbra",
}

_SYLLABLES: List[str] = [
    "li",
    "ra",
    "ba",
    "no",
    "ka",
    "se",
    "tu",
    "ven",
    "zor",
    "mi",
    "pha",
    "el",
]

VOWEL_SUFFIXES = {
    "a": "ra",
    "e": "ri",
    "i": "la",
    "o": "no",
    "u": "ma",
}


def normalize_text(text: str) -> str:
    """Return a normalized representation of *text*.

    The transformation keeps alphanumeric characters and apostrophes, removes
    other punctuation, collapses multiple spaces and converts the text to lower
    case. The helper is primarily meant to improve matching against the
    ``DEFAULT_DICTIONARY`` and to aid deterministic pseudo-word generation.
    """

    lowered = text.lower()
    cleaned = re.sub(r"[^a-z0-9'\s]+", " ", lowered)
    collapsed = re.sub(r"\s+", " ", cleaned).strip()
    return collapsed


def _procedural_word(word: str, syllables: Iterable[str] = _SYLLABLES) -> str:
    """Create a deterministic pseudo-word for *word*.

    The algorithm walks through the characters of ``word`` and uses their code
    points and positions to index into the ``syllables`` list. The result is a
    pronounceable string that is stable between runs which helps keep tests
    deterministic.
    """

    if not word:
        return ""

    pieces: List[str] = []
    syllable_list = list(syllables)
    if not syllable_list:
        raise ValueError("syllables must not be empty")

    for index, character in enumerate(word):
        base = ord(character)
        syllable_index = (base + index) % len(syllable_list)
        pieces.append(syllable_list[syllable_index])

    if word[-1] in VOWEL_SUFFIXES:
        pieces.append(VOWEL_SUFFIXES[word[-1]])

    return "".join(pieces)


def _apply_casing(source: str, translated: str) -> str:
    """Adjust *translated* so its casing matches *source*."""

    if not source:
        return translated
    if source.isupper():
        return translated.upper()
    if source[0].isupper():
        return translated.capitalize()
    return translated


def english_to_libran(text: str, dictionary: Dict[str, str] | None = None) -> str:
    """Translate *text* into Libran using ``dictionary`` when possible."""

    mapping = {**DEFAULT_DICTIONARY}
    if dictionary:
        mapping.update({k.lower(): v for k, v in dictionary.items()})

    tokens = _TOKEN_RE.findall(text)
    translated_tokens: List[str] = []
    for token in tokens:
        if token.isalpha() or token.replace("'", "").isalnum():
            lookup_key = token.lower()
            translated = mapping.get(lookup_key)
            if not translated:
                normalized = normalize_text(token)
                translated = mapping.get(normalized)
            if not translated:
                translated = _procedural_word(normalize_text(token))
            translated_tokens.append(_apply_casing(token, translated))
        else:
            translated_tokens.append(token)
    return "".join(translated_tokens)


__all__ = ["english_to_libran", "normalize_text", "DEFAULT_DICTIONARY"]
