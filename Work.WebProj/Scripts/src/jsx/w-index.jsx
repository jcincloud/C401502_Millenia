//主表單
var GirdForm = React.createClass({
	getInitialState: function() {  
		return {
			n:[0,1,2,3,4]
		};  
	},
	getDefaultProps:function(){
		return{};
	},	
	componentDidMount:function(){
	},
	render: function() {
		var outHtml = null;

		outHtml=(
		<div>
			<form className="form-horizontal">
				<div className="form-group">
				{
					this.state.n.map(function(itemData,i) {
						var out_html = <div key={itemData}>{itemData}:<input type="text" className="form-control" /></div>;
						return out_html;
					})
				}
				</div>
			</form>
		</div>
		);
		return outHtml;
	}
});