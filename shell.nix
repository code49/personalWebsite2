{ pkgs ? import <nixpkgs> {} }:

(pkgs.buildFHSEnv {
  name = "jekyll-env";

  # Packages available inside the FHS environment
  targetPkgs = pkgs: (with pkgs; [
    ruby
    bundler
    gcc
    gnumake
    pkg-config
    libffi
    zlib
    libxml2
    libxslt
    nodejs_20
    
    # Standard libraries often needed by pre-compiled binaries
    stdenv.cc.cc.lib
    openssl
  ]);

  # Environment variables to set inside the shell
  profile = ''
    export GEM_HOME="$PWD/.bundle"
    export PATH="$GEM_HOME/bin:$PATH"
    export JEKYLL_ENV="development"
  '';

  # Command to run when entering the shell (gives you a bash prompt)
  runScript = "bash -c './start-local.sh; bash'"; 
}).env
