from english_to_libran_voice.converter import english_to_libran, normalize_text


def test_normalize_text_strips_punctuation_and_lowercases():
    assert normalize_text("Hello, World!!") == "hello world"


def test_english_to_libran_uses_default_dictionary():
    text = "Hello world!"
    result = english_to_libran(text)
    assert "Valori" in result
    assert "zenith" in result.lower()


def test_english_to_libran_is_deterministic_for_unknown_words():
    first = english_to_libran("mystery")
    second = english_to_libran("Mystery")
    assert first.lower() == second.lower()


def test_custom_dictionary_is_respected():
    custom = {"friend": "allya"}
    result = english_to_libran("Friend")
    assert "Kaleth" in result
    override = english_to_libran("Friend", dictionary=custom)
    assert "Allya" in override
