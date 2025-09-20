"""Command line interface for the Libran text to voice toolkit."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Optional

from .converter import english_to_libran
from .synthesizer import LibranSynthesizer


def _read_text(args: argparse.Namespace) -> str:
    if args.text:
        return args.text
    if args.input_file:
        return Path(args.input_file).read_text(encoding="utf-8")
    return sys.stdin.read()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Convert English text into Libran and optionally synthesize audio.")
    parser.add_argument("--text", help="Text to convert. If omitted a file or stdin is used.")
    parser.add_argument("--input-file", help="Read English text from a file.")
    parser.add_argument("--audio-output", help="Write a synthesized wave file to this path.")
    parser.add_argument(
        "--symbol-duration",
        type=float,
        default=0.12,
        help="Duration of each synthesized symbol in seconds (default: 0.12)",
    )
    parser.add_argument(
        "--sample-rate",
        type=int,
        default=22_050,
        help="Sample rate for the synthesized audio (default: 22050)",
    )
    return parser


def main(argv: Optional[list[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    english_text = _read_text(args)
    libran_text = english_to_libran(english_text)
    print(libran_text)

    if args.audio_output:
        synthesizer = LibranSynthesizer(sample_rate=args.sample_rate, symbol_duration=args.symbol_duration)
        synthesizer.save(libran_text, args.audio_output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
