//後台行動裝置登錄
var LoginForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			validateUrl: this.getValidateUrl(),
			validate:null,
			account:null,
			password:null
		};  
	},
	getDefaultProps:function(){
		return{};
	},
	componentWillMount:function(){
		//在輸出前觸發，只執行一次如果您在這個方法中呼叫 setState() ，會發現雖然 render() 再次被觸發了但它還是只執行一次。
		// var brower=getBrower();
		// if(!brower.match("Chrome")){
		// 	alert("本系統只支援Chrome瀏覽器!!");
		// 	document.location.href = gb_approot + 'Content/images/noIE/noIE.html';
		// }
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var data = {
			account:this.state.account,
			password:this.state.password,
			validate:this.state.validate,
			lang:'zh-TW',
			rememberme:false
		};

		var jqxhr = $.ajax({
							type: "POST",
							url: gb_approot + 'Base/Login/ajax_Login',
							data: data,
							dataType: 'json'
							})
					.done(function(data, textStatus, jqXHRdata) {
						if(data.result){
							document.location.href=data.url;
						}else{
							this.reLoadValidateUrl();
							this.setState({password:null,validate:null});
							alert(data.message);
						}
					 }.bind(this))
					.fail(function( jqXHR, textStatus, errorThrown ) {
						showAjaxError(errorThrown);
					});
		return;
	},
	getValidateUrl:function(){
		return this.props.webRoot + '_Code/Ashx/ValidateCodeB.ashx?vn=CheckCode&t=' + uniqid();
	},
	reLoadValidateUrl:function(){
		this.setState({validateUrl: this.getValidateUrl(),value:null});
	},
	onChange:function(e){
		this.setState({value:event.target.value});
	},
	onChangeUpper:function(e){
		this.setState({validate:e.target.value.toUpperCase()});
	},
	render: function() {
		return (
			<div className="login-form col-md-8 center-block">
			    <div className="panel panel-primary">
			        <div className="panel-heading">
			            <h3 className="panel-title">美樂/隼昌 業務管理系統::系統登入(Tablet)</h3>
			        </div>
			        <form onSubmit={this.handleSubmit} className="form-horizontal">
			            <div className="panel-body">
			                <div className="form-group">
			                    <label for="" className="control-label col-xs-1">帳號</label>
			                    <div className="col-xs-5">
			                    	<input type="text" className="form-control" valueLink={this.linkState('account')} required/>
			                    </div>
			                    <label for="" className="control-label col-xs-1">密碼</label>
			                    <div className="col-xs-5">
			                    	<input type="password" className="form-control" valueLink={this.linkState('password')} required/>
			                    </div>
			                </div>
			                <hr />
			                <div className="form-group">
			                    <label for="" className="control-label col-xs-1">驗證</label>
			                    <div className="col-xs-5">
			                        <img src={this.state.validateUrl} alt="驗證碼" width="100%" />
			                    </div>
			                	<div className="col-xs-6">
			                    	<input type="number" className="form-control" value={this.state.validate} onChange={this.onChangeUpper} required />
			                    	<small className="help-block">
				                    	請輸入圖片中的文字
				                    	<button type="button" className="btn-link" onClick={this.reLoadValidateUrl}>換另一張圖</button>
				                	</small>
			                    </div>
			                </div>
			            </div>
			            <div className="panel-footer">
			                <button className="btn btn-success btn-lg btn-block">確定登入</button>
			            </div>
			        </form>
			    </div>
			</div>
			);
	}
});