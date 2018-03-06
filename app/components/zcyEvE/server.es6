export default {
  //获取指定页面、区划的装修模板
  getTemplate: param => {
    let url = '/api/template/view';
    if(param.page){
      url = '/api/template/view2';
    }
    return $.ajax({
      spins: true,
      type: 'get',
      url: url,
      contentType: 'application/json',
      data: {
        ...param
      }
    })
  },
  //获取某一站点下的所有页面
  getWC: params => $.ajax({
    spins: true,
    type: 'get',
    url: '/api/template/getWC',
    traditional: true
  }),
  create: param => $.ajax({
    spins: true,
    type: 'post',
    url: '/api/template/create',
    contentType: 'application/json',
    data: JSON.stringify(param)
  }),
  //删除模板
  deleteTemplate: param => $.ajax({
    spins: true,
    type: 'post',
    url: '/api/template/delete',
    contentType: 'application/json',
    data: JSON.stringify(param)
  }),
  updata: param => $.ajax({
    spins: true,
    type: 'post',
    url: '/api/template/update',
    contentType: 'application/json',
    data: JSON.stringify(param)
  }),
  //all
  getAllTemplate: params => $.ajax({
    spins: true,
    type: 'get',
    url: '/api/template/viewAll',
    traditional: true,
    data: {
      ...params
    }
  })
};
