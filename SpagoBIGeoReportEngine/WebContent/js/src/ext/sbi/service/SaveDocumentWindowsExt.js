/** SpagoBI, the Open Source Business Intelligence suite

 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. **/

Ext.ns("Sbi.service.utils");

Sbi.service.SaveDocumentWindowExt = function(config) {
		this.services = new Array();
		
		var saveDocParams= {
			LIGHT_NAVIGATOR_DISABLED: 'TRUE',
			standardUrl:true
		};
		
		if(config.MESSAGE_DET != undefined && config.MESSAGE_DET != null ){
			saveDocParams.MESSAGE_DET = config.MESSAGE_DET;
		
			if(config.dataset_label != undefined && config.dataset_label != null ){
				saveDocParams.dataset_label = config.dataset_label;
			}
			
		} else{
			saveDocParams.MESSAGE_DET = 'DOC_SAVE';		
		}
	
		this.services['saveDocumentService'] = Sbi.config.serviceRegistry.getServiceUrl({
			serviceName: 'SAVE_DOCUMENT_ACTION'
			, baseParams: saveDocParams
			, baseUrl:{contextPath: 'SpagoBI', controllerPath: 'servlet/AdapterHTTP'}
		});
		this.services['getCommunities'] =  Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'community/user'
				, baseParams: {LIGHT_NAVIGATOR_DISABLED: 'TRUE',EXT_VERSION: "3"}
				, baseUrl:{contextPath: 'SpagoBI'}
		});
		
		this.SBI_EXECUTION_ID = config.SBI_EXECUTION_ID;
		this.OBJECT_ID = config.OBJECT_ID;
		this.OBJECT_TYPE = config.OBJECT_TYPE;
		this.OBJECT_ENGINE = config.OBJECT_ENGINE;
		this.OBJECT_TEMPLATE = config.OBJECT_TEMPLATE;
		this.OBJECT_DATA_SOURCE = config.OBJECT_DATA_SOURCE;
		this.OBJECT_WK_DEFINITION = config.OBJECT_WK_DEFINITION;
		this.OBJECT_QUERY = config.OBJECT_QUERY;
		this.OBJECT_FORM_VALUES = config.OBJECT_FORM_VALUES;
		this.OBJECT_PREVIEW_FILE = config.OBJECT_PREVIEW_FILE;		
		this.OBJECT_COMMUNITY = config.OBJECT_COMMUNITY;
		this.OBJECT_SCOPE = config.OBJECT_SCOPE;
		
		this.initFormPanel(config.formState);
		
		var c = Ext.apply({}, config, {
			id:'popup_docSave',
			layout:'fit',
			width:700, //640,
			height:350, //450,
			closeAction: 'destroy',
			buttons:[{ 
				  iconCls: 'icon-save' 	
				, handler: this.saveDocument
				, scope: this
				, text: 'Salva' //LN('sbi.generic.update')
	           }],
			title: 'Inserisci ulteriori dettagli e prosegui con il salvataggio del tuo documento... ', // LN('sbi.execution.saveDocument'),
			items: this.saveDocumentForm
		});   
		
		Ext.apply(this,c);
		
		// constructor
		Sbi.service.SaveDocumentWindowExt.superclass.constructor.call(this, c);
	    
	};

Ext.extend(Sbi.service.SaveDocumentWindowExt, Ext.Window, {
	inputForm: null,
	saveDocumentForm: null,
	fileNameUploaded: null,
	SBI_EXECUTION_ID: null,
	OBJECT_ID: null,
	OBJECT_TYPE: null,
	OBJECT_ENGINE: null,
	OBJECT_TEMPLATE: null,
	OBJECT_DATA_SOURCE: null,
	OBJECT_PARS: null,
	OBJECT_PREVIEW_FILE: null,
	OBJECT_COMMUNITY: null,
	OBJECT_SCOPE: null,
	
	initFormPanel: function (c){
		this.docLabel =  new Ext.form.TextField({
			id:'docLabel',
	        name: 'docLabel',
	        height: 0,			
			value:c.docLabel,
			hidden:true
	    });
		this.docLabel.setValue(c.docLabel);
		
		this.docName = new Ext.form.TextField({
			id: 'docName',
			name: 'docName',
			allowBlank: false, 
			inputType: 'text',
			maxLength: 200,
			enforceMaxLength: true,
			anchor: '95%',
			fieldLabel:'Nome',// LN('sbi.generic.name') ,
			value:c.docName
	    });
		this.docName.setValue(c.docName);
		
		this.docDescr = new Ext.form.TextField({
			id:'docDescr',
	        name: 'docDescr',
	        inputType: 'text',
	        allowBlank: true, 
	        maxLength: 400,
	        anchor:	 '95%',
	        height: 80,
			fieldLabel:'Descrizione',// LN('sbi.generic.descr'),
			value:c.docDescr			
	    });
		this.docDescr.setValue(c.docDescr); 


		this.docVisibility = new Ext.form.Checkbox({
			fieldLabel:'Document Visibility',
			id:'docVisibility',
	        boxLabel  : 'Visible',
            name      : 'docVisibility',
            inputValue: 1,
            checked   : c.visibility
           });
	
		// The data store holding the communities
//		var storeComm = new Ext.data.Store({
//			proxy:{
//				type: 'rest',
//				url : this.services['getCommunities'],
//				reader: {
//					type: 'json',
//					root: 'root'
//				}
//			},
//
//			fields: [
//			         "communityId",
//			         "name",
//			         "description",
//			         "owner",
//			         "functCode"],
//		    //autoLoad: true
//			         autoload:false
//		});

		this.docCommunity = new Ext.form.ComboBox({
		    fieldLabel: 'Community',
		    queryMode: 'local',
//		    store: storeComm,
		    displayField: 'name',
		    valueField: 'functCode',
		    allowBlank: true
		});
		
		var storeScope = new Ext.data.SimpleStore({
		    fields: ['field', 'value'],
		    data : [
		        ["true", "Public"],
		        ["false", "Private"]
		    ]
		});
		
		this.isPublic =new Ext.form.ComboBox({
		    fieldLabel: 'Scope',
		    mode : 'local',
		    store: storeScope,
		    displayField: 'value',
		    valueField: 'field',
		    allowBlank: false,
		    defaultValue: c.scope
		});

		var index = 0; // or whatever
//		this.isPublic.setValue(c.scope);

		
		this.fileUpload = this.initFileUpload();
	    
	    this.inputForm = new Ext.Panel({
	         itemId: 'detail'
	        , columnWidth: 0.6
	        , border: false
	        , items: {
	 		   	 columnWidth: 0.4,
	             xtype: 'fieldset',
	             labelWidth: 80,
	             defaults: {border:false},    
	             defaultType: 'textfield',
	             autoScroll  : true,
	             border: false,
	             style: {
	                 "margin-left": "4px",
	                 "margin-top": "25px"
	             },
	             items: [this.docName,this.docDescr,this.docVisibility,this.fileUpload, this.docCommunity, this.isPublic]
//	             items: [this.docLabel,this.docName,this.docDescr,this.docVisibility,this.fileUpload,this.isPublic]
	    	}
	    });
	    
	    
	    this.treePanel =  new Sbi.geo.widgets.DocumentsTree({
	    	  columnWidth: 0.4,
	          border: false,
	          drawUncheckedChecks: true,
	          docFunctionalities: c.docFunctionalities
	    });
	    
	    this.saveDocumentForm =  new Ext.form.FormPanel({
		          autoScroll: true,
		          labelAlign: 'left',
		          autoWidth: true,
		          height: 250,
		          layout: 'column',
		          columnWidth:	0.1,
		          scope:this,
		          forceLayout: true,
		          trackResetOnLoad: true,
		          layoutConfig : {
		 				animate : true,
		 				activeOnTop : false

		 			},
		          items: [
		              this.inputForm
		              , this.treePanel           	  		
		          ]
		          
		      });
	}
	
	,saveDocument: function () {
		 
		var docLabel = this.docLabel.getValue();
		var docName = this.docName.getValue();
		var docDescr = this.docDescr.getValue();
		var docVisibility = this.docVisibility.getValue();
		var isPublic = this.isPublic.getValue();
		var functs = this.treePanel.returnCheckedIdNodesArray();
		var query = this.OBJECT_QUERY;
		var previewFile =  this.fileNameUploaded;
		var docCommunity = '';// this.docCommunity.getValue();
		
		if(query!=undefined && query!=null){
			query = Ext.util.JSON.encode(query);
		}	
		if(previewFile!=undefined && previewFile!=null){
			previewFile = Ext.util.JSON.encode(previewFile);
		}
		
		if(docLabel == null || docLabel == undefined || docLabel == '' ||
		   ((functs == null || functs == undefined || functs.length == 0)
//			&&   (docCommunity == null || docCommunity == undefined || docCommunity == '')
			)){
				Ext.MessageBox.show({
	                title: LN('sbi.generic.warning'),
	                msg:  LN('sbi.document.saveWarning'),
	                width: 180,
	                buttons: Ext.MessageBox.OK
	           });
		}else{	
			functs = Ext.util.JSON.encode(functs);
			var params = {
		        	name :  docName,
		        	label : docLabel,
		        	description : docDescr,
		        	visibility: docVisibility,
		        	obj_id: this.OBJECT_ID,
					typeid: this.OBJECT_TYPE,
					previewFile: previewFile,
					query: query,
					template: this.OBJECT_TEMPLATE,
					datasourceid: this.OBJECT_DATA_SOURCE,
					communityid: docCommunity,
					isPublic: isPublic,
					SBI_EXECUTION_ID: this.SBI_EXECUTION_ID,
					functs: functs
		        };
			
			Ext.Ajax.request({
		        url: this.services['saveDocumentService'],
		        params: params,
		        success : function(response , options) {
			      		if(response !== undefined && response.responseText !== undefined) {
			      			var content = Ext.util.JSON.decode( response.responseText );
			      			if(content.responseText !== 'Operation succeded') {
			                    Ext.MessageBox.show({
			                        title: LN('sbi.generic.error'),
			                        msg: content,
			                        width: 150,
			                        buttons: Ext.MessageBox.OK
			                   });              
				      		}else{			      			
				      			Ext.MessageBox.show({
				                        title: LN('sbi.generic.result'),
				                        msg: LN('sbi.generic.resultMsg'),
				                        width: 200,
				                        buttons: Ext.MessageBox.OK
				                });
				      			 this.destroy();
				      		}  
			      		} else {
			      			Sbi.exception.ExceptionHandler.showErrorMessage('Server response is empty', 'Service Error');
			      		}  	  		
		        },
		        scope: this,
				failure: Sbi.exception.ExceptionHandler.handleFailure      
			});
		}
	}
	, initFileUpload: function(){
		//upload preview file
		var config={
				isEnabled: true, 
				labelFileName:'Preview file'				
		};
		var c = {};
		if (Sbi.settings.widgets.FileUploadPanel && Sbi.settings.widgets.FileUploadPanel.imgUpload)
			c = Ext.apply({}, config, Sbi.settings.widgets.FileUploadPanel.imgUpload); 		
		else
			c = Ext.apply({}, config); 	
		Ext.apply(this,c);
		
		this.fileUpload = new Sbi.geo.widgets.FileUploadPanel(c);

		var uploadButton = this.fileUpload.fileUploadFormPanel.getComponent('fileUploadButton');	
		uploadButton.setHandler(this.uploadFileButtonHandler,this);
//		var toReturn = new  Ext.FormPanel({
		var toReturn = new  Ext.Panel({
			  id: 'mapPreviewFileForm',
			  fileUpload: true, // this is a multipart form!!
			  isUpload: true,
			  border:false,
			  layout:'form',
			  enctype:'multipart/form-data',
			  method: 'POST',
	          labelAlign: 'left',
	          bodyStyle:'padding:1px',
	          autoScroll:true,
	          trackResetOnLoad: true,
	          items: [this.fileUpload]
	      });
		
		return toReturn;
	}
	
	//handler for the upload file button
	,uploadFileButtonHandler: function(btn, e) {
		
		Sbi.debug("[PreviewFileWizard.uploadFileButtonHandler]: IN");
		var pippo =Ext.getCmp('mapPreviewFileForm'); 
        var form = Ext.getCmp('mapPreviewFileForm').getForm();
        
        Sbi.debug("[PreviewFileWizard.uploadFileButtonHandler]: form is equal to [" + form + "]");
		
        var completeUrl =  Sbi.config.serviceRegistry.getServiceUrl({
					    		serviceName : 'MANAGE_FILE_ACTION',
					    		baseParams : {LIGHT_NAVIGATOR_DISABLED: 'TRUE'}
					    	});

		var baseUrl = completeUrl.substr(0, completeUrl
				.indexOf("?"));
		
		Sbi.debug("[PreviewFileWizard.uploadFileButtonHandler]: base url is equal to [" + baseUrl + "]");
	 	
		var queryStr = completeUrl.substr(completeUrl.indexOf("?") + 1);
		var params = Ext.urlDecode(queryStr);
		params.operation = 'UPLOAD';
		params.directory = this.directory || '';
		params.maxSize = this.maxSizeFile || '';
		params.extFiles = this.extFiles || '';
 
		Sbi.debug("[PreviewFileWizard.uploadFileButtonHandler]: form is valid [" + form.isValid() + "]");		
		this.fileNameUploaded = Ext.getCmp('fileUploadField').getValue();
		this.fileNameUploaded = this.fileNameUploaded.replace("C:\\fakepath\\", "");

		form.submit({
			clientValidation: false,
			url : baseUrl // a multipart form cannot
							// contain parameters on its
							// main URL; they must POST
							// parameters
			,
			params : params,
			waitMsg : LN('sbi.generic.wait'),
			success : function(form, action) {
				Ext.MessageBox.alert('Success!','File Uploaded to the Server');
				this.fileNameUploaded = action.result.fileName;
			},
			failure : function(form, action) {
				switch (action.failureType) {
	            case Ext.form.Action.CLIENT_INVALID:
	                Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
	                break;
	            case Ext.form.Action.CONNECT_FAILURE:
	                Ext.Msg.alert('Failure', 'Ajax communication failed');
	                break;
	            case Ext.form.Action.SERVER_INVALID:
	            	if(action.result.msg && action.result.msg.indexOf("NonBlockingError:")>=0){
	            		var error = Ext.util.JSON.decode(action.result.msg);
	            		Sbi.exception.ExceptionHandler.showErrorMessage(LN('sbi.ds.'+error.error),LN("sbi.ds.failedToUpload"));
	            	}else{
	            		Sbi.exception.ExceptionHandler.showErrorMessage(action.result.msg,'Failure');
	            	}
	               
				}
			},
			scope : this
		});		
		
		Sbi.debug("[PreviewFileWizard.uploadFileButtonHandler]: OUT");
	}

});