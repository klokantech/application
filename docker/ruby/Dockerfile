# Use oficial Ruby 2.5.1
FROM ruby:2.5.1
# Install dependencies:
# - build-essential: To ensure certain gems can be compiled
# - nodejs for a JS runtime
# - yarn: Install & manage node modules [should make npm obsolete]
# - mysql-client: Database client
# - libpq-dev
# - libxml2-dev libxslt1-dev for nokogiri
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -qq -y build-essential \
    nodejs \
    yarn \
    mysql-client \
    libpq-dev \
    libxml2-dev \
    imagemagick \
    libxslt1-dev
# Command line collection runner for Postman
RUN npm install -g newman
# Create unprivileged user, prosaically called app
RUN useradd --user-group --create-home --shell /bin/false app
ENV HOME=/home/app
# Create known_hosts
RUN mkdir -p $HOME/.ssh && touch $HOME/.ssh/known_hosts
# Add bitbucket and github key
RUN ssh-keyscan bitbucket.org >> $HOME/.ssh/known_hosts
RUN ssh-keyscan github.com >> $HOME/.ssh/known_hosts

# Copy files into the container
COPY ./src/Gemfile ./src/Gemfile.lock $HOME/lol/
COPY ./src/package.json ./src/yarn.lock $HOME/lol/
#COPY ./docker-key $HOME/.ssh/id_rsa
# Chown copies files
RUN chown -R app:app $HOME
# Set working directory
WORKDIR $HOME/lol
# Make user app own files
USER app
# use the mounted gems container as the location of the gems so we don't have to start from scratch each time.
#ENV BUNDLE_PATH /gems
RUN bundle install