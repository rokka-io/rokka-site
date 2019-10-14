Rokka
=====

This is the repository for [rokka.io](https://rokka.io/) which includes documentation and general information about the image delivery service.

Local Development
-----------------

Do have the rendered output immediatly on your development environment, do:

```
composer install && npm install
./node_modules/.bin/gulp
```

and then open [http://localhost:3000](http://localhost:3000) in your browser

Check for broken links
----------------------

Run the local server as mentioned above, then do

```
./node_modules/.bin/blc http://localhost:3000/documentation --filter-level 3 -ro --exclude https://www.liip.ch/en/blog/tags/rokka --exclude https://www.drupal.org/project/rokka --exclude http://localhost:3000/dashboard/#/signup 

```

For some strange reason, the blog/tags and drupal links are 404, that's why we exclude them here.


Documentation
-----------------

Documentation is split into guides and the API reference. Both are written in [markdown](https://daringfireball.net/projects/markdown/).
Have a look at the existing files under _guides and _references.

For the generation of the docs we use [Sculpin](https://sculpin.io/documentation/).
