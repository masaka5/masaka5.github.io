# Ubuntu Server browser VM

Ubuntu 24.04 LTS Minimal runs its actual glibc userland, Python 3, systemd,
APT and dpkg on an emulated x86-64 machine with four virtual CPUs by default.
The image uses the bundled Alpine 6.6 VirtIO kernel. The browser appliance
target starts the two consoles, volatile journal, shared folder coordination
and terminal/screen synchronization. Cloud provisioning, Snap and physical CPU
microcode are omitted; they are unnecessary for this fixed virtual hardware.
The optional APT cloud subscription hook is disabled: it otherwise starts late
system initialization, whose temporary-file cleanup can interrupt APT's first
signature check. The console agent only publishes changed frames once per second.

## Networking

The static site uses the browser's HTTP(S) fetch bridge. No local server,
public relay or credential is required. A site must allow browser CORS for its
responses to be readable. Raw Internet TCP/UDP, ICMP, SSH and ordinary DNS
queries cannot pass through this bridge. The guest's `ip`, `ss`, `ifconfig`,
`netstat` and other tools operate on the real emulated network interfaces;
`ping` cannot establish Internet reachability in this mode.

Use `network` for interface/routes and these limits, `network check` to fetch
Ubuntu repository headers, `network dns example.com` for a real DNS-over-HTTPS
lookup, and `network get URL [FILE]` to download a CORS-enabled HTTP(S) resource.
`curl` and `wget` also work through the configured proxy and guest CA bundle.

APT uses `https://mirrors.sdu.edu.cn/ubuntu/`, which permits browser CORS.
Packages remain verified against Ubuntu's archive signing key; HTTPS verification
is enabled. APT prefers gzip indexes to reduce decompression work on the emulated
CPU. `apt-get update` followed by `apt-get install -y hello` installs
the real Ubuntu package. Repositories without CORS will fail in this browser
mode even when they are reachable from a normal desktop terminal.
Retained base packages are marked manually installed, so `apt autoremove` does
not treat the appliance's systemd, Python or network tools as cloud dependencies.

## Storage and snapshots

The guest root is in memory. Use `/mnt/共享` for host/browser file transfer and
save a complete snapshot to preserve installed packages and system changes.
Replacing the image changes its fingerprint. Older snapshots remain stored but
are rejected explicitly when their image/engine/hardware fingerprint differs.
They are never silently deleted or applied to a different image.

## Rebuilding

`_scratch/build-ubuntu-toolbox-image.py` checks the pinned official rootfs SHA-256,
reads archives as data, and writes a deterministic initramfs and manifest.
`--stage` writes the four published image parts. Update the Ubuntu image hash in
`vm-core.js` whenever the image changes. The manifest records source and image
hashes, compressed size and expanded size.
