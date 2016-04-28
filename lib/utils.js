/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar', temp : 'Some var' }
 *       , b = { bar: 'baz' , temp : null};
 *
 *     utils.merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *     // => temp variable is removed
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */

exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
      if (a[key] === null)
      	delete a[key]
    }
  }
  return a;
};
