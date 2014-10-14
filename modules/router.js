
var EM = require('./email-dispatcher');
var utils = require('./utils.js');

var testing = true;
var timer = 0;
module.exports = function(app) {

// main login page //
    app.get('/',function(req,res){
    });
    app.post('/', function(req, res){

	});
    app.delete('/', function(req,res){
    });

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

    var responseComplete = function(message){
                                var ET =  moment();
                                var ST = app.get('t1');
                                var fST = moment(ST).format("H:mm:ss:SSS");
                                var fET = moment(ET).format("H:mm:ss:SSS");
                                app.set('t2', ET);
                                console.log('***********************************************************');
                                console.log('Response Complete ' + message);
                                console.log('TIMING-- Start: ' + fST + ' End: ' + fET + ' Diff: ' + ET.diff(ST) + 'ms');
                                console.log('***********************************************************');

                            }
    var responseBegin = function(message){
                                var startTime = moment();
                                app.set('t1', startTime );
                                console.log('***********************************************************');
                                console.log(message + ' Response Begin');
                                console.log('TIMEING--START: ' + startTime);
                                console.log('***********************************************************');

                            }
};