# Semantic Versioning Guide

This project follows [Semantic Versioning 2.0.0](https://semver.org/) (SemVer) for version management.

## Version Format

Versions follow the format: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, major feature overhauls
- **MINOR** (1.0.0 → 1.1.0): New features, non-breaking changes
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, minor improvements

## Pre-release Versions

Pre-release versions are supported:
- `1.0.0-alpha.1` - Alpha releases
- `1.0.0-beta.1` - Beta releases  
- `1.0.0-rc.1` - Release candidates

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat:` - New features (triggers minor release)
- `fix:` - Bug fixes (triggers patch release)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions or changes
- `build:` - Build system changes
- `ci:` - CI configuration changes
- `chore:` - Other changes that don't modify src or test files
- `revert:` - Revert previous commits

### Examples

```bash
feat(ui): add voice preview component
fix(api): resolve TTS caching issue
docs: update installation guide
chore(deps): update dependencies
```

## Release Process

### Quick Release Commands

```bash
# Patch release (bug fixes)
npm run release:patch

# Minor release (new features)
npm run release:minor

# Major release (breaking changes)
npm run release:major

# Dry run (preview changes)
npm run release:dry-run
```

### Full Release Process

For a complete release with pre-checks:

```bash
# Patch release with full validation
npm run release:full:patch

# Minor release with full validation
npm run release:full:minor

# Major release with full validation
npm run release:full:major
```

The full release process includes:
1. ✅ Pre-flight checks (clean working directory, correct branch)
2. ✅ Running all tests
3. ✅ TypeScript type checking
4. ✅ ESLint validation
5. ✅ Building the project
6. ✅ Creating the release
7. ✅ Generating changelog

### Manual Release Steps

1. **Ensure clean working directory**
   ```bash
   git status
   git add .
   git commit -m "chore: prepare for release"
   ```

2. **Run tests and validation**
   ```bash
   npm run test:all
   npm run type-check
   npm run lint
   npm run build
   ```

3. **Create release**
   ```bash
   npm run release:patch  # or minor/major
   ```

4. **Push changes**
   ```bash
   git push --follow-tags origin dev
   ```

## Version Display

The current version is displayed in the UI footer using the `VersionDisplay` component:

```tsx
import VersionDisplay from '@/app/components/VersionDisplay'

<VersionDisplay className="footer-version" />
```

## Changelog

The changelog is automatically generated from conventional commits and stored in `CHANGELOG.md`.

### Manual Changelog Generation

```bash
# Generate changelog for current version
npm run changelog

# Generate complete changelog
npm run changelog:all
```

## Configuration

Semantic versioning is configured in:
- `.versionrc` - Standard-version configuration
- `commitlint.config.js` - Commit message validation
- `package.json` - Release scripts and version

## Best Practices

1. **Always use conventional commits** - This ensures automatic changelog generation
2. **Test before releasing** - Use `npm run release:full:*` for validation
3. **Keep commits atomic** - One logical change per commit
4. **Use descriptive commit messages** - Clear, concise descriptions
5. **Tag releases** - Git tags are automatically created
6. **Document breaking changes** - Use `BREAKING CHANGE:` in commit footer

## Troubleshooting

### Release Fails
- Ensure working directory is clean
- Run `npm run release:dry-run` to preview changes
- Check that all tests pass

### Version Not Updating
- Verify commit messages follow conventional format
- Check `.versionrc` configuration
- Ensure `package.json` version is correct

### Changelog Issues
- Verify commit messages are properly formatted
- Run `npm run changelog:all` to regenerate
- Check for merge commits that might interfere
