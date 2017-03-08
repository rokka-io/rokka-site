module.exports = {
  languages: ['en','de'],
  dest: 'dist/',
  styles: {
    src: 'source-assets/styles/rokka.scss',
    dest: 'dist/assets/styles/',
    watch: 'source-assets/styles/**/*.scss'
  },
  scripts: {
    src: 'source-assets/scripts/*.js',
    dest: 'dist/assets/scripts/',
    watch: 'source-assets/scripts/**/*.js'
  }
};
