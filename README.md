Rokka
=====

This is the repository for the __Rokka Site__ which includes documentation and general information about the service.

Local Development
-----------------

Do have the rendered output immediatly on your development environment, do:

```
composer install
vendor/sculpin/sculpin/bin/sculpin generate --watch --server
```

and then open [http://localhost:8000](http://localhost:8000) in your browser


Documentation
-----------------

Documentation is split into guides and the API reference. Both are written in [markdown](https://daringfireball.net/projects/markdown/).
Have a look at the existing files under _guides and _references.

For the generation of the docs we use [Sculpin](https://sculpin.io/documentation/).
