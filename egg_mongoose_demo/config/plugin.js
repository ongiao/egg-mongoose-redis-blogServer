'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },

  static: {
    enable : true,
    package : 'egg-static'
  },

  validate: {
    enable: true,
    package: 'egg-validate',
  }
};
