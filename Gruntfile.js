//Grunt file only for live reload functions

module.exports = function (grunt) {

  grunt.initConfig({
    express: {
      dev: {
        options: {
          script: './index.js'
        }
      }
    },
    watch: {
      express: {
        files:  [ '*.js' ],
        tasks:  [ 'express' ],
        options: {
          livereload: 35729,
          spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('server', ['express:dev', 'watch']);
};
