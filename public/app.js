var socket = io.connect('https://104.154.250.123:8000', {forceNew:true, query:'foo=bar'});

socket.on('messages', function(data){
	console.log(data); 

	render(data);
});
socket.on('sent-message', function(){
	var errorLabel = document.getElementById('errors');
	errorLabel.innerHTML = '<small>Mensaje enviado</small>';
	setTimeout(function(){
		errorLabel.innerHTML = '';
		document.getElementById('user').value = '';
		document.getElementById('text').value = '';
	}, 500);
});

function render(data){
	var html = data.map(function(data, idx){
		return('<div>\
                        <strong>'+data.author+': </strong>\
                        <em>'+data.text+'</em>\
                </div>');
	}).join(' ');
	
	document.getElementById('messages').innerHTML = html;
}

function addMessages(evt){
	var payload = {
		author: document.getElementById('user').value,
		text: document.getElementById('text').value
	};
	
	socket.emit('new-message', payload);
	return false;
}
