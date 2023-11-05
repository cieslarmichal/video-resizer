#!/usr/bin/env bash
echo 'deb http://www.deb-multimedia.org jessie main non-free' >> /etc/apt/sources.list
echo 'deb-src http://www.deb-multimedia.org jessie main non-free' >> /etc/apt/sources.list
apt-get update
apt-get install -y deb-multimedia-keyring
apt-get install -y ffmpeg
