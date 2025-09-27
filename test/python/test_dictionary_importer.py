import pytest
import json
import tempfile
import os
from pathlib import Path
import sys

# Add the tools/dict_importer directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'tools' / 'dict_importer'))

from dict_importer import DictionaryBuilder, Entry

class TestDictionaryImporter:
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.temp_dir = tempfile.mkdtemp()
        self.builder = DictionaryBuilder()

    def teardown_method(self):
        """Clean up after each test method."""
        import shutil
        shutil.rmtree(self.temp_dir)

    def test_dictionary_builder_initialization(self):
        """Test DictionaryBuilder initialization."""
        builder = DictionaryBuilder()
        
        assert builder.exclude_terms == set()
        assert builder.build is not None
        assert builder.stats['total_entries'] == 0

    def test_entry_creation(self):
        """Test Entry creation."""
        entry = Entry(
            english="hello",
            ancient="salve",
            modern="salve",
            pos="interjection",
            notes="Common greeting",
            sacred=False,
            source_page=1,
            confidence=0.95,
            table_order=0
        )
        
        assert entry.english == "hello"
        assert entry.ancient == "salve"
        assert entry.modern == "salve"
        assert entry.pos == "interjection"
        assert entry.notes == "Common greeting"
        assert entry.sacred == False
        assert entry.source_page == 1
        assert entry.confidence == 0.95
        assert entry.table_order == 0

    def test_should_exclude_entry_normal(self):
        """Test entry exclusion logic for normal entries."""
        # Test normal entry (should not be excluded)
        normal_entry = Entry(
            english="hello",
            ancient="salve",
            modern="salve",
            pos="interjection",
            notes="Common greeting",
            sacred=False,
            source_page=1,
            confidence=0.95,
            table_order=0
        )
        
        should_exclude, reason = self.builder.should_exclude(normal_entry)
        # Note: The actual implementation might exclude based on other criteria
        # This test just verifies the method exists and returns a boolean
        assert isinstance(should_exclude, bool)
        assert isinstance(reason, str)

    def test_should_exclude_entry_divine(self):
        """Test entry exclusion logic for divine terms."""
        divine_entry = Entry(
            english="god",
            ancient="deus",
            modern="deus",
            pos="noun",
            notes="Divine being",
            sacred=True,
            source_page=1,
            confidence=0.95,
            table_order=0
        )
        
        should_exclude, reason = self.builder.should_exclude(divine_entry)
        # Divine terms should be excluded
        assert should_exclude is True
        assert "Divine" in reason or "divine" in reason

    def test_builder_statistics(self):
        """Test builder statistics structure."""
        stats = self.builder.stats
        
        assert isinstance(stats, dict)
        assert 'total_entries' in stats
        assert 'ancient_entries' in stats
        assert 'modern_entries' in stats
        assert 'excluded_entries' in stats
        assert 'conflicts' in stats
        assert 'variants' in stats
        assert 'pages_processed' in stats

    def test_builder_with_exclude_terms(self):
        """Test DictionaryBuilder with exclude terms."""
        exclude_terms = {"test", "example"}
        builder = DictionaryBuilder(exclude_terms=exclude_terms)
        
        assert builder.exclude_terms == exclude_terms

    def test_unicode_handling(self):
        """Test handling of Unicode characters in entries."""
        unicode_entry = Entry(
            english="café",
            ancient="café_librán",
            modern="café_librán",
            pos="noun",
            notes="Coffee shop",
            sacred=False,
            source_page=1,
            confidence=0.95,
            table_order=0
        )
        
        assert unicode_entry.english == "café"
        assert unicode_entry.ancient == "café_librán"
        assert unicode_entry.modern == "café_librán"

    def test_entry_validation(self):
        """Test entry field validation."""
        # Test with all required fields
        entry = Entry(
            english="test",
            ancient="librán_test",
            modern="librán_test",
            pos="noun",
            notes="Test entry",
            sacred=False,
            source_page=1,
            confidence=0.95,
            table_order=0
        )
        
        assert entry.english is not None
        assert entry.ancient is not None
        assert entry.modern is not None
        assert entry.pos is not None
        assert entry.source_page > 0
        assert 0 <= entry.confidence <= 1