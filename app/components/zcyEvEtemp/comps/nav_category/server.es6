export default {
  getPage: param => $.ajax({
    spins: true,
    type: 'get',
    url: '/api/template/all',
    contentType: 'application/json'
  })
};
