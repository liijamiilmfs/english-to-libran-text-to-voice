#!/usr/bin/env python3
"""
Custom Librán tokenizer for language model training
Handles Librán-specific characters and linguistic patterns
"""

import json
import os
import re
from typing import List, Dict, Set, Tuple
from collections import Counter
import tokenizers
from tokenizers import Tokenizer, models, normalizers, pre_tokenizers, processors, trainers

class LibránTokenizer:
    """
    Custom tokenizer for Librán language that handles:
    - Librán-specific characters (áéíóúëñçüÁÉÍÓÚËÑÇÜ)
    - Linguistic patterns and morphology
    - Ancient vs Modern variants
    """
    
    def __init__(self, vocab_size: int = 30000, max_length: int = 512):
        self.vocab_size = vocab_size
        self.max_length = max_length
        self.special_tokens = {
            'unk_token': '[UNK]',
            'cls_token': '[CLS]',
            'sep_token': '[SEP]',
            'pad_token': '[PAD]',
            'mask_token': '[MASK]',
            'ancient_token': '[ANCIENT]',
            'modern_token': '[MODERN]'
        }
        self.libran_chars = 'áéíóúëñçüÁÉÍÓÚËÑÇÜ'
        self.tokenizer = None
        self.vocab = {}
        
    def load_dictionaries(self) -> Tuple[Dict, Dict]:
        """Load Ancient and Modern Librán dictionaries"""
        try:
            # Load dictionaries from the project structure
            ancient_path = os.path.join('lib', 'translator', 'dictionaries', 'ancient.json')
            modern_path = os.path.join('lib', 'translator', 'dictionaries', 'modern.json')
            
            with open(ancient_path, 'r', encoding='utf-8') as f:
                ancient_dict = json.load(f)
            
            with open(modern_path, 'r', encoding='utf-8') as f:
                modern_dict = json.load(f)
                
            return ancient_dict, modern_dict
        except FileNotFoundError as e:
            print(f"Dictionary file not found: {e}")
            return {}, {}
        except json.JSONDecodeError as e:
            print(f"Error parsing dictionary JSON: {e}")
            return {}, {}
    
    def prepare_training_corpus(self) -> List[str]:
        """Prepare training corpus from dictionary entries"""
        ancient_dict, modern_dict = self.load_dictionaries()
        corpus = []
        
        # Add dictionary entries
        for english, libran in ancient_dict.items():
            if isinstance(libran, str):
                corpus.append(f"[ANCIENT] {english} → {libran}")
                
        for english, libran in modern_dict.items():
            if isinstance(libran, str):
                corpus.append(f"[MODERN] {english} → {libran}")
        
        # Add synthetic sentences
        corpus.extend(self.generate_synthetic_sentences())
        
        # Add linguistic patterns
        corpus.extend(self.extract_linguistic_patterns())
        
        return corpus
    
    def generate_synthetic_sentences(self) -> List[str]:
        """Generate synthetic sentences for training"""
        sentences = []
        
        # Common sentence patterns
        patterns = [
            "The {noun} is {adjective}",
            "I {verb} the {noun}",
            "This is a {adjective} {noun}",
            "We {verb} in the {noun}",
            "My {noun} is {adjective}",
            "They {verb} {adverb}",
        ]
        
        # This would be expanded with actual vocabulary from dictionaries
        vocabulary = {
            'nouns': ['cat', 'dog', 'house', 'tree', 'water', 'fire', 'earth', 'air'],
            'verbs': ['see', 'walk', 'run', 'eat', 'drink', 'sleep', 'think', 'speak'],
            'adjectives': ['big', 'small', 'red', 'blue', 'fast', 'slow', 'good', 'bad'],
            'adverbs': ['quickly', 'slowly', 'well', 'badly', 'here', 'there', 'now', 'then']
        }
        
        for pattern in patterns:
            for _ in range(20):  # Generate 20 variations per pattern
                sentence = pattern
                sentence = sentence.replace('{noun}', self._random_choice(vocabulary['nouns']))
                sentence = sentence.replace('{verb}', self._random_choice(vocabulary['verbs']))
                sentence = sentence.replace('{adjective}', self._random_choice(vocabulary['adjectives']))
                sentence = sentence.replace('{adverb}', self._random_choice(vocabulary['adverbs']))
                
                # Randomly assign variant
                variant = '[ANCIENT]' if hash(sentence) % 2 == 0 else '[MODERN]'
                sentences.append(f"{variant} {sentence}")
        
        return sentences
    
    def extract_linguistic_patterns(self) -> List[str]:
        """Extract linguistic patterns from the dictionary"""
        patterns = [
            "[ANCIENT] Common suffix: -ing",
            "[MODERN] Common suffix: -ed", 
            "[ANCIENT] Common prefix: un-",
            "[MODERN] Common prefix: re-",
            "[ANCIENT] Plural formation: -s",
            "[MODERN] Past tense: -ed",
        ]
        return patterns
    
    def train_tokenizer(self, corpus: List[str]) -> None:
        """Train the BPE tokenizer on Librán corpus"""
        print(f"Training tokenizer on {len(corpus)} sentences...")
        
        # Initialize tokenizer
        self.tokenizer = Tokenizer(models.BPE(unk_token=self.special_tokens['unk_token']))
        
        # Set up normalizer to handle Librán characters
        self.tokenizer.normalizer = normalizers.Sequence([
            normalizers.NFD(),  # Unicode normalization
            normalizers.Lowercase(),
        ])
        
        # Set up pre-tokenizer
        self.tokenizer.pre_tokenizer = pre_tokenizers.Whitespace()
        
        # Train the tokenizer
        trainer = trainers.BpeTrainer(
            vocab_size=self.vocab_size,
            special_tokens=list(self.special_tokens.values()),
            min_frequency=2
        )
        
        self.tokenizer.train_from_iterator(corpus, trainer)
        
        # Set up post-processor
        self.tokenizer.post_processor = processors.TemplateProcessing(
            single=f"{self.special_tokens['cls_token']} $A {self.special_tokens['sep_token']}",
            pair=f"{self.special_tokens['cls_token']} $A {self.special_tokens['sep_token']} $B:1 {self.special_tokens['sep_token']}:1",
            special_tokens=[
                (self.special_tokens['cls_token'], self.tokenizer.token_to_id(self.special_tokens['cls_token'])),
                (self.special_tokens['sep_token'], self.tokenizer.token_to_id(self.special_tokens['sep_token'])),
            ]
        )
        
        print("Tokenizer training completed!")
    
    def save_tokenizer(self, path: str) -> None:
        """Save the trained tokenizer"""
        if self.tokenizer is None:
            raise ValueError("Tokenizer not trained yet!")
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.tokenizer.save(path)
        print(f"Tokenizer saved to {path}")
    
    def load_tokenizer(self, path: str) -> None:
        """Load a trained tokenizer"""
        self.tokenizer = Tokenizer.from_file(path)
        print(f"Tokenizer loaded from {path}")
    
    def tokenize(self, text: str) -> List[str]:
        """Tokenize a text string"""
        if self.tokenizer is None:
            raise ValueError("Tokenizer not trained or loaded yet!")
        
        encoding = self.tokenizer.encode(text)
        return encoding.tokens
    
    def encode(self, text: str) -> List[int]:
        """Encode text to token IDs"""
        if self.tokenizer is None:
            raise ValueError("Tokenizer not trained or loaded yet!")
        
        encoding = self.tokenizer.encode(text)
        return encoding.ids
    
    def decode(self, token_ids: List[int]) -> str:
        """Decode token IDs back to text"""
        if self.tokenizer is None:
            raise ValueError("Tokenizer not trained or loaded yet!")
        
        return self.tokenizer.decode(token_ids)
    
    def get_vocab_size(self) -> int:
        """Get the vocabulary size"""
        if self.tokenizer is None:
            return 0
        return self.tokenizer.get_vocab_size()
    
    def get_vocab(self) -> Dict[str, int]:
        """Get the vocabulary mapping"""
        if self.tokenizer is None:
            return {}
        return self.tokenizer.get_vocab()
    
    def analyze_libran_patterns(self) -> Dict[str, any]:
        """Analyze Librán linguistic patterns"""
        ancient_dict, modern_dict = self.load_dictionaries()
        
        patterns = {
            'character_frequency': Counter(),
            'word_length_distribution': Counter(),
            'prefixes': Counter(),
            'suffixes': Counter(),
            'ancient_vs_modern_differences': {}
        }
        
        # Analyze character frequency
        all_text = ' '.join(ancient_dict.values()) + ' '.join(modern_dict.values())
        for char in all_text.lower():
            patterns['character_frequency'][char] += 1
        
        # Analyze word lengths
        for libran_word in list(ancient_dict.values()) + list(modern_dict.values()):
            if isinstance(libran_word, str):
                patterns['word_length_distribution'][len(libran_word)] += 1
        
        # Analyze prefixes and suffixes
        for libran_word in list(ancient_dict.values()) + list(modern_dict.values()):
            if isinstance(libran_word, str) and len(libran_word) > 2:
                # Common prefixes
                if libran_word.startswith(('un', 're', 'pre', 'dis')):
                    patterns['prefixes'][libran_word[:2]] += 1
                
                # Common suffixes
                if libran_word.endswith(('ing', 'ed', 'ly', 'er', 'est')):
                    patterns['suffixes'][libran_word[-2:]] += 1
        
        return patterns
    
    def _random_choice(self, choices: List[str]) -> str:
        """Random choice from a list"""
        import random
        return random.choice(choices)

def main():
    """Main function to train and save the Librán tokenizer"""
    print("Initializing Librán Tokenizer...")
    
    tokenizer = LibránTokenizer(vocab_size=30000, max_length=512)
    
    print("Preparing training corpus...")
    corpus = tokenizer.prepare_training_corpus()
    print(f"Corpus prepared: {len(corpus)} sentences")
    
    print("Training tokenizer...")
    tokenizer.train_tokenizer(corpus)
    
    print("Analyzing Librán patterns...")
    patterns = tokenizer.analyze_libran_patterns()
    
    # Save tokenizer
    tokenizer_path = 'models/checkpoints/libran_tokenizer.json'
    tokenizer.save_tokenizer(tokenizer_path)
    
    # Save pattern analysis
    patterns_path = 'data/training/processed/libran_patterns.json'
    os.makedirs(os.path.dirname(patterns_path), exist_ok=True)
    with open(patterns_path, 'w', encoding='utf-8') as f:
        json.dump(patterns, f, indent=2, ensure_ascii=False)
    
    print(f"Tokenizer vocabulary size: {tokenizer.get_vocab_size()}")
    print("Librán tokenizer training completed successfully!")

if __name__ == "__main__":
    main()
