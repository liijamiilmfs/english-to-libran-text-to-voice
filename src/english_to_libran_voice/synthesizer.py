"""Generate simple speech-like audio for Libran text."""
from __future__ import annotations

import io
import math
import struct
import wave
from dataclasses import dataclass


def _char_frequency(character: str) -> float:
    """Return a pseudo phoneme frequency for *character*."""

    base_map = {
        "a": 440.0,
        "e": 493.88,
        "i": 523.25,
        "o": 587.33,
        "u": 659.25,
        "l": 392.0,
        "r": 415.3,
        "n": 349.23,
        "s": 329.63,
    }
    if character.lower() in base_map:
        return base_map[character.lower()]
    if character.isalpha():
        offset = (ord(character.lower()) - ord("a")) % 26
        return 300.0 + offset * 12.5
    if character.isdigit():
        return 250.0 + int(character) * 20.0
    return 0.0


@dataclass
class LibranSynthesizer:
    """Convert Libran text into a waveform using sine synthesis."""

    sample_rate: int = 22_050
    symbol_duration: float = 0.12
    amplitude: int = 16_000

    def synthesize(self, text: str) -> bytes:
        """Return a mono wave file stored in memory for ``text``."""

        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(self.sample_rate)
            frames = self._frames_for_text(text)
            wav_file.writeframes(frames)
        return buffer.getvalue()

    def save(self, text: str, path: str) -> None:
        """Write the synthesized Libran speech for ``text`` to ``path``."""

        audio = self.synthesize(text)
        with open(path, "wb") as handle:
            handle.write(audio)

    def _frames_for_text(self, text: str) -> bytes:
        frames = bytearray()
        samples_per_symbol = int(self.sample_rate * self.symbol_duration)
        for character in text:
            frequency = _char_frequency(character)
            if frequency == 0.0:
                frames.extend(b"\x00\x00" * samples_per_symbol)
                continue
            for index in range(samples_per_symbol):
                angle = 2.0 * math.pi * frequency * index / self.sample_rate
                sample = int(self.amplitude * math.sin(angle))
                frames.extend(struct.pack("<h", sample))
        return bytes(frames)


__all__ = ["LibranSynthesizer"]
