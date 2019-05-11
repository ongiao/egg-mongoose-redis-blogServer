'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  // *************用户****************
  router.post('/user/signup', controller.userController.signup);
  router.post('/user/signin', controller.userController.signin);
  router.get('/user/signout', controller.userController.signout);
  // router.get('user/cancelAccount', controller.userController.cancelAccount);

  // *************博客文章****************
  router.get('/article/getArticleDetail', controller.articleController.getArticleDetail);
  router.get('/article/getAllArticlesDetail', controller.articleController.getAllArticlesDetail);
  router.post('/article/create', controller.articleController.create);
  router.post('/article/update', controller.articleController.update);
  router.post('/article/delete', controller.articleController.delete);

  // *************文章类型****************
  router.post('/catelog/create', controller.catelogController.create);
  router.post('/catelog/update', controller.catelogController.update);
  router.post('/catelog/delete', controller.catelogController.delete);
  router.get('/catelog/getCatelogDetail', controller.catelogController.getCatelogDetail);
  router.get('/catelog/getAllCatelogsDetail', controller.catelogController.getAllCatelogsDetail);
  router.get('/catelog/getCatelogArticles', controller.catelogController.getCatelogArticles);

};
