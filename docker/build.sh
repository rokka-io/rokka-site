
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

docker build -t docker.gitlab.liip.ch/rokka/rokka-site-build-docker .