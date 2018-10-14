module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    assets_inline: {
      all: {
        files: {
          "./dist/index.html": "./src/index.html"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-assets-inline");
  grunt.registerTask("default", ['assets_inline']);
};
