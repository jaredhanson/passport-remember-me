import {expect} from "chai";
import {Strategy} from '../lib/index.js'

describe('passport-remember-me', function() {

  it('should export Strategy', function() {
    expect(Strategy).to.be.a('function');
  });

});
