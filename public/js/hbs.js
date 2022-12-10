var paginate = require('handlebars-paginate');

Handlebars.registerHelper('paginate', paginate);

/* ... */

var html = template({
  pagination: {
    page: 3,
    pageCount: 10
  }
});