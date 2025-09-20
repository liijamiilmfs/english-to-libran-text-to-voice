# english-to-libran-text-to-voice

A Python toolkit that transforms English paragraphs into a fictional Libran
language and optionally generates a simple spoken rendition. The audio output is
based on deterministic sine-wave synthesis which keeps the project lightweight
and dependency free.

## Features

- Normalizes and translates English text into a consistent Libran dialect
- Deterministic pseudo-word generation for unknown vocabulary
- Simple sine-wave speech synthesizer that outputs standard PCM wave files
- Command line interface with optional audio export

## Getting started

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
```

Run the unit test suite with:

```bash
pytest
```

## Command line usage

Translate text provided directly on the command line:

```bash
libran-voice --text "Hello world!"
```

Read from a file and export audio:

```bash
libran-voice --input-file paragraph.txt --audio-output output.wav
```

You can adjust synthesis parameters such as the symbol duration and sample rate
via command-line flags. The generated audio is intentionally stylized and does
not represent a real language; it serves as a placeholder for early prototyping.
