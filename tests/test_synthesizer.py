from english_to_libran_voice.synthesizer import LibranSynthesizer


def test_synthesize_produces_wave_bytes(tmp_path):
    synthesizer = LibranSynthesizer(symbol_duration=0.01)
    audio_bytes = synthesizer.synthesize("lira")
    assert audio_bytes.startswith(b"RIFF")

    path = tmp_path / "sample.wav"
    synthesizer.save("lira", path)
    assert path.exists()
    assert path.read_bytes().startswith(b"RIFF")
