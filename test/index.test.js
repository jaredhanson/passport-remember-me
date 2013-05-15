var rememberme = require('index');


describe('passport-remember-me', function() {
    
  it('should export version', function() {
    expect(rememberme.version).to.be.a('string');
  });
    
  it('should export Strategy', function() {
    expect(rememberme.Strategy).to.be.a('function');
  });
  
});
