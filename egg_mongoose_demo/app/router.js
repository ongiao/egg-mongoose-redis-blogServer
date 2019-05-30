'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // *************默认页****************
  router.get('/', controller.home.index);

  // *************系统管理员****************
  

  // *************用户****************
  router.post('/user/signup', controller.userController.signup);
  router.post('/user/signin', controller.userController.signin);
  router.get('/user/signout', controller.userController.signout);
  router.get('/user/getUserDetail', controller.userController.getUserDetail);

  // *************用户关注和取关****************
  // router.get('/userRelation/follow', controller.userRelationController.follow); // 关注
  // router.get('/userRelation/cancelFollow', controller.userRelationController.cancelFollow); // 关注

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

  // *************评论****************
  router.post('/comment/create', controller.commentController.create);
  router.post('/comment/delete', controller.commentController.delete);
  router.get('/comment/getCommentDetail', controller.commentController.getCommentDetail);

  // *************赞****************
  router.get('/like/create', controller.likeDislikeController.createLike);
  router.get('/like/getEntityLikeCount', controller.likeDislikeController.getEntityLikeCount);

  // ************踩****************
  router.get('/dislike/create', controller.likeDislikeController.createDislike);
  router.get('/dislike/getEntityDislikeCount', controller.likeDislikeController.getEntityDislikeCount);

  // ************搜索****************
  router.post('/search', controller.searchController.search);

  // ************收藏夹****************
  // 用户收藏夹（后面还应增加用户收藏夹的搜索功能）
  router.post('/collection/create', controller.collectionController.create); // 创建收藏夹
  router.get('/collection/getCollectionDetail', controller.collectionController.getCollectionDetail); 
  router.post('/collection/update', controller.collectionController.update); // 更新收藏夹
  router.post('/collection/delete', controller.collectionController.delete); // 删除收藏夹
  router.get('/collection/collectArticle', controller.collectionController.collectArticle); // 收藏文章
  router.get('/collection/cancelCollectedArticle', controller.collectionController.cancelCollectedArticle); // 取消文章的收藏
  router.post('/collection/search', controller.collectionController.search); // 取消文章的收藏

  // ************私信消息****************
  // 后续增加补充

};
