'use strict';
// Author: Petter Andersson

var map;
var date;
const htmlListID = 'marked';
const htmlResultID = 'result';
const htmlInnerID = 'markedInner';

/*
	TODO
		Välja multiple om man vill för vissa ämnen, t.ex. när på dagen
		Bättre css etc
*/

function DataObject(name, newQuestion=''){
	this.name = name;
	this.question = newQuestion;
	this.heldObjects = [];
	this.list = [];
	
	this.setQuestion = function(newQuestion){
		this.question = newQuestion;
	}

	this.toString = function(){
		var s = name + '{ List: {';
		for(var i = 0; i < this.list.length; i++){
			if(i === 0){
				s += '\n';
			}
			s += '\t' + this.list[i] + '\n';
		}
		s += '} heldObjects: {'
		for(var i = 0; i < this.heldObjects.length; i++){
			if(i === 0){
				s += '\n';
			}
			s += '\t' + this.heldObjects[i] + '\n';
		}
		s += '}';
		return s;
	}

	this.setList = function(list){
		this.list = list;
	}
	this.addElement = function(element, conditionCallback=defaultTrue){
		if(conditionCallback()){
			console.log('Added ' + element + ' to ' + this.name);
			this.list.push(element);		
		}
	}
	this.addObject = function(dataObject){
		if(dataObject instanceof DataObject){
			this.heldObjects.push(dataObject)
			console.log('Pushed object ' + dataObject);		
		} else {
			console.log('Invalid object to add, not of DataObject type');
		}
	}	
	this.addObject = function(objName, question='', innerList=[]){
		var tempObj = new DataObject(objName);
		tempObj.setList(innerList);
		if(question !== ''){
			tempObj.setQuestion(question);
		}
		this.heldObjects.push(tempObj);
		console.log('Pushed object ' + objName + ' to array: ' + this.heldObjects[this.heldObjects.length-1] + '\n');
	}

	this.getObject = function(objName){
		var success = false;
		for(var i = 0; i < this.heldObjects.length; i++){
		//	console.log('DEBUG @getObject', this.heldObjects[i].name, objName);
			if(this.heldObjects[i].name === objName){
				success = true;
				return this.heldObjects[i];
			}
		}
		if(success === false){
			console.log('Invalid key name'); // Throw err?
		}
		return null;
	}
	this.addInnerList = function(objName, list){
		this.getObject(objName).setList(list);	
	}
	this.addInnerElement = function(objName, newEl, conditionCallback=defaultTrue){
		this.getObject(objName).addElement(newEl, conditionCallback);
	}
}

function main(){
	date = new Date();
	initMap();
	updateVisibleList(map);
}

function initMap(){
	console.log('@initMap');
	var data = new DataObject('data', 'List Checker');
	data.setList(['laddad mobil', 'hörlurar', 'nycklar']); // Fill me with alltid saker

	// Aktivitet, kräver val: Vad ska du göra?
	data.addObject('activity', 'Vad ska du göra?');

	data.getObject('activity').addObject('hänga');
	data.getObject('activity').addInnerList('hänga', ['alvedon', 'plånbok']);

	data.getObject('activity').addObject('bada');
	data.getObject('activity').addInnerList('bada', ['bikini', 'handduk', 'ombyte', 'h&aring;rborste']);

	data.getObject('activity').addObject('shoppa');
	data.getObject('activity').addInnerList('shoppa', ['plånbok']);

	data.getObject('activity').addObject('träna', 'Träna: 	Hur ska du träna?');
	var trainingList =  ['vattenflaska', 'hårsnodd', 'träningskläder'];
	data.getObject('activity').getObject('träna').addObject('gym');
	data.getObject('activity').getObject('träna').addObject('inte gym');
	data.getObject('activity').getObject('träna').addInnerList('gym', trainingList.concat(['lås', 'friskiskort', 'träningsskor']));
	data.getObject('activity').getObject('träna').addInnerList('inte gym', trainingList);

	// Seasons, görs automatiskt

	data.addObject('timeofday', 'När på dagen är det?');
	data.getObject('timeofday').addObject('dagen');
	data.getObject('timeofday').addInnerElement('dagen', 'solskyddskräm', function(){
		return isBetweenMonths(4, 7);
	});
	data.getObject('timeofday').addInnerElement('dagen', 'solglasögon', function(){
		return isBetweenMonths(4, 7);
	});

	data.getObject('timeofday').addObject('kvällen');
	data.getObject('timeofday').addInnerElement('kvällen', 'myggmedel', function(){
		return isBetweenMonths(4, 7);
	});

	data.addElement('allergimedicin', function(){
		return isBetweenMonths(2, 4);
	});

	// Finns det risk för regn?
	data.addObject('väderregn', 'Finns det risk för regn?');
	data.getObject('väderregn').addObject('Ja');
	data.getObject('väderregn').addObject('Nej');
	data.getObject('väderregn').addInnerList('Ja', ['paraply']);
	map = data;
}

// Inclusive on both start and end
// Summer: Maj - august: 4-7
// Spring: mars -maj: 2-4
function isBetweenMonths(start, end){ // January = 0
	var mm = date.getMonth();
	console.log('DEBUG @isBetweenMonths', start, end, mm, (mm >= start && mm <= end));
	if(mm >= start && mm <= end){
		return true;
	}
	return false;
}

function getListFromMarked(){
	console.log('@getListFromMarked');
	var marked = document.getElementById(htmlListID);
	console.log(marked); // Loop over me and initialize as usable data to return
	var set = new Set(map.list);
	console.log(set);
	getChecked(map, marked, set);
	console.log(set);
	updateResult(set);
}

function getChecked(mapStruct, htmlData, set){
	//console.log(htmlData);
	console.log('@getChecked', mapStruct.heldObjects);
	for(var i = 0; i < mapStruct.heldObjects.length; i++){
		var tempObj = mapStruct.heldObjects[i];
		if(tempObj.question === ''){ // Root
			var foo = document.getElementById(tempObj.name);
			if(foo.checked){
				//console.log(tempObj.name + ' is checked! Adding its list');
				for(var j = 0; j < tempObj.list.length; j++){
					set.add(tempObj.list[j]);
				}
			} else {
				//console.log(tempObj.name + ' is not checked');
			}
		} else{
			for(var j = 0; j < tempObj.list.length; j++){ // Borde inte alltid läggas till
				set.add(tempObj.list[j]);
			}
			getChecked(tempObj, htmlData, set);
		}
	}
}

function updateResult(set){
	var body = document.getElementById(htmlResultID);
	var ul = document.createElement('ul');
	set.forEach(element => {
		var innerName = element;
		var el = document.createElement('li');
		var text = document.createTextNode(innerName);
		ul.appendChild(el);
		ul.appendChild(text);
	});
	//var currBody = document.getElementById(htmlInnerID);
	//currBody.replaceChild(ul, body);
	body.appendChild(ul);
}

function updateVisibleList(obj){ // DataObject
	var body = document.getElementById(htmlListID);
	updateHTML(body, obj, -1, 2);
}

function updateHTML(body, obj, index, num){
	for(var i = 0; i < obj.heldObjects.length; i++){
		var temp = obj.heldObjects[i];
		var question = temp.question;

		if(question === ''){ // Show options
			var innerName = temp.name;
			var el = document.createElement('input');
			var text = document.createTextNode(innerName);
			el.setAttribute('type', 'radio');
			el.setAttribute('id', innerName);
			el.setAttribute('value', innerName);
			el.setAttribute('name', 'group' + index);
			var br = document.createElement('br');
			body.appendChild(el);
			body.appendChild(text);
			body.appendChild(br);
		} else{ // Print headline
			// <input type="radio" value="sommar" name="group1"> Sommar <br>
			var h2 = document.createElement('h' + num);
			var h2Text = document.createTextNode(question);
			h2.appendChild(h2Text);
			body.appendChild(h2);
			var tempIndex = index;
			if(index === -1){
				tempIndex = i;
			}
			updateHTML(body, obj.heldObjects[i], tempIndex, num + 2);
		}
	}
}

function defaultTrue(){
	return true;
}
