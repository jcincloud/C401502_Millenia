//主表單
var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			searchData:{title:null},
			edit_type:0,
			checkAll:false,
			option_users:[],
			users_id:null,
			grid_area:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Product'

		};
	},	
	componentDidMount:function(){

		this.querySales();
		//this.queryLeftProduct();
		//this.queryRightProduct();
	},
	handleSubmit: function(e) {

		e.preventDefault();
		if(this.state.edit_type==1){
			jqPost(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					tosMessage(null,'新增完成',1);
					this.updateType(data.id);
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
		else if(this.state.edit_type==2){
			jqPut(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					tosMessage(null,'修改完成',1);
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		};
		return;
	},
	queryArea:function(){
			jqGet(gb_approot + 'api/GetAction/GetUsersArea',{users_id:this.state.users_id})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_area:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},	
	querySales:function(){

			jqGet(gb_approot + 'api/GetAction/GetUsers',{})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({option_users:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});		
	},
	queryChangeUsers:function(e){
		this.state.users_id = e.target.value;
		this.setState({users_id:e.target.value});
		this.queryArea();
	},
	insertType:function(){
		this.setState({edit_type:1,fieldData:{}});
	},
	updateType:function(id){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:2,fieldData:data.data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	noneType:function(){
		this.gridData(0)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:0,gridData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	changeFDValue:function(name,e){
		this.setInputValue(this.props.fdName,name,e);
	},
	changeGDValue:function(name,e){
		this.setInputValue(this.props.gdName,name,e);
	},
	setFDValue:function(fieldName,value){
		//此function提供給次元件調用，所以要以屬性往下傳。
		var obj = this.state[this.props.fdName];
		obj[fieldName] = value;
		this.setState({fieldData:obj});
	},
	setInputValue:function(collentName,name,e){

		var obj = this.state[collentName];
		if(e.target.value=='true'){
			obj[name] = true;
		}else if(e.target.value=='false'){
			obj[name] = false;
		}else{
			obj[name] = e.target.value;
		}
		this.setState({fieldData:obj});
	},
	setArea:function(index,e){

		var area_data = this.state.grid_area[index];

		var parm = {
			users_id:this.state.users_id,
			area_id:area_data.area_id,
			is_take:!area_data.is_take
		};

		jqPost(gb_approot + 'api/GetAction/PostSetUsersArea',parm)
		.done(function(data, textStatus, jqXHRdata) {
			var obj = this.state;
			area_data.is_take=!area_data.is_take;
			this.setState(obj);
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});

	},
	render: function() {
		var outHtml = null;
		var fieldData = {};
		outHtml =(
			<div>
				<ul className="breadcrumb">
					<li><i className="fa-list-alt"></i> {this.props.MenuName}</li>
				</ul>
				<h3 className="title">
					{this.props.Caption}
				</h3>

				<div className="table-responsive">
					<div className="table-header">
						<div className="table-filter">
							<div className="form-inline">
								<div className="form-group">
									<label>選擇業務</label> { }
									<select className="form-control" 
									onChange={this.queryChangeUsers}
									value={this.state.users_id}>
									<option value=""></option>
									{
										this.state.option_users.map(function(itemData,i) {
											var out_sub_html =                     
											<option value={itemData.Id} key={itemData.Id}>{itemData.UserName}</option>;
											return out_sub_html;
										}.bind(this))
									}
									</select>
								</div> { }
							</div>
						</div>
					</div>
					<table className="table-condensed">
						<tbody>
							<tr>
								<th>地區名稱</th>
								<th className="text-center"></th>
							</tr>
							{
								this.state.grid_area.map(function(itemData,i) {
									var out_sub_html =                     
									<tr key={itemData.users_id + ':' + itemData.area_id}>
									<td>{itemData.area_name}</td>
									<td className="text-center">
										<input type="checkbox" checked={itemData.is_take} onChange={this.setArea.bind(this,i)} />
									</td>
									</tr>;
									return out_sub_html;
								}.bind(this))
							}
						</tbody>
					</table>
				</div>
					
				
			</div>

		);

		return outHtml;
	}
});