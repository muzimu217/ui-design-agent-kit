# License Supplements

Vite's built-in `build.license` collects the packages actually present in output chunks.
The Pages assembler retains those texts, with exact-version supplements only when
an npm tarball omitted its license file. Missing text for an unknown package blocks assembly.

- `react-three-fiber-9.7.0.txt`: retrieved from the published package's npm `gitHead`
  `0a107412ac64667b1908422e859447952f57feef`,
  <https://github.com/pmndrs/react-three-fiber/blob/0a107412ac64667b1908422e859447952f57feef/LICENSE>.

These supplements preserve upstream notices; they do not relicense the Agent kit.
