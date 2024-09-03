#!/usr/bin/env bash

set -euxo pipefail

if [ -z ${1+x} ]
then
    echo "Please provide a Git hash or other tree-ish"
    exit 1
fi

rm -rf tmp
mkdir -p tmp
git archive -o tmp/source.tar "$1"

pushd tmp
tar xf source.tar
rm source.tar
popd

DIR=levana-predict-$1
rm -rf "$DIR"
mkdir -p "$DIR"

mv -i tmp/.ci/contracts.sh tmp/contract/build.sh
mv -i tmp/contract "$DIR"

rm -rf tmp

pushd "$DIR/contract"
cargo test
rm -rf target
./build.sh
popd

mkdir -p source-tarballs
cp "$DIR/wasm/artifacts/checksums.txt" "source-tarballs/$DIR-checksums.txt"
rm -rf "$DIR/wasm"
tar czfv "source-tarballs/$DIR.tar.gz" "$DIR"
rm -rf "$DIR"
