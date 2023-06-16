/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url','N/ui/message'],
    function(url,message) {
        let globalContext;

        function pageInit(scriptContext){
            globalContext = scriptContext;
            let curRec=globalContext.currentRecord;          
            let task_submit =  curRec.getValue({fieldId : 'custpage_task_submit' });
            let task_status =  curRec.getValue({ fieldId : 'custpage_task_status'});
            if(task_submit=='T'){
                showMessage(task_status);
            }
        }
        function fieldChanged(scriptContext) {
            let currentRec = scriptContext.currentRecord;
            let fieldId = scriptContext.fieldId;
            let triggerFieldChange = listenEventHandler(fieldId)
            if (triggerFieldChange) {
                let fieldsObj = getFormFields(currentRec);
                let pageId = currentRec.getValue({ fieldId : 'custpage_pageid'});

                window.onbeforeunload= null;
                document.location = url.resolveScript({
                    scriptId : 'customscript_hzpc0041_sl_net_receivables',
                    deploymentId : 'customdeployhzpc0041_sl_net_receivables_',
                    params : {
                        'page' : pageId,
                    }
                });
            }
        }

        function getSuiteletPage(suiteletScriptId, suiteletDeploymentId, pageId){

            let formFieldsObj = getFormFields(globalContext.currentRecord);
            let { subsidiary} = formFieldsObj;
            window.onbeforeunload= null;

            document.location = url.resolveScript({
                scriptId : suiteletScriptId,
                deploymentId : suiteletDeploymentId,
                params : {
                    'page' : pageId,
                    'subsidiary':subsidiary,
                }
            });
        }

        function getParameterFromURL(param) {
            let query = window.location.search.substring(1);
            let vars = query.split("&");
            for (let i = 0; i < vars.length; i++) {
                let pair = vars[i].split("=");
                if (pair[0] == param) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return false;
        }


        function listenEventHandler(fieldId){

            if(fieldId === 'custpage_pageid'){
                return true;
            }
        }

        function getFormFields(curRec){

            let pageId = curRec.getValue({
                fieldId : 'custpage_pageid'
            });
          
            let subsidiary =  curRec.getValue({
                fieldId : 'custpage_subsidiary'
            });
          
            return{
               pageId:pageId,
                subsidiary:subsidiary
            }

        }
		function saveRecord(scriptContext) {
			try {
				var objRecord=scriptContext.currentRecord;
				var numLines = objRecord.getLineCount({
					sublistId: 'custpage_hzpc0041_sublist'
				});
              var flg=false;
              var types=[];
				for(var i=0;i<numLines;i++){
					var check=objRecord.getSublistValue({
						sublistId: 'custpage_hzpc0041_sublist',
						fieldId: 'custpage_hzpc0041_select',
						line:i
					});
                  var type=objRecord.getSublistValue({
						sublistId: 'custpage_hzpc0041_sublist',
						fieldId: 'custpage_type',
						line:i
					});
					if(check){
                       types.push(type);
                      
                      flg=true
                     };
				}
            
              if(types.indexOf('Bill Credit')!=-1){
                if (types.indexOf('Bill')==-1){
                   alert('Please select at least one Bill');
					return false;
                 }
                 }
               if(types.indexOf('Credit Memo')!=-1){
                 if(types.indexOf('Invoice')==-1){
                  alert('Please select at least one Invoice ');
					return false;
                 }
                 }
                   
				if(flg==false){
					alert('Please select at least one line');
					return false;
				}else{return true}
			}catch(e){log.error('ERROR',e)}
	
		}
        const showMessage=(currentStatus)=>{
			if(currentStatus != '' && currentStatus != null){
				var custMsg = '';
				if(currentStatus.toLowerCase() != 'complete' && currentStatus.toLowerCase() != 'failed' && currentStatus.toLowerCase() != 'cancelled'){
					custMsg = message.create({
						title: "", 
						message: "The submitted job is "+currentStatus+", click on refresh to check the status", 
						type: message.Type.INFORMATION
					});
					custMsg.show({ duration : 0 });
				}else if(currentStatus.toLowerCase() == 'complete'){
					custMsg = message.create({
						title: "", 
						message: "The submitted job is "+currentStatus, 
						type: message.Type.CONFIRMATION
					});
					custMsg.show({ duration : 0 });
				}else{
					custMsg = message.create({
						title: "", 
						message: "The submitted job is "+currentStatus, 
						type: message.Type.ERROR
					});
					custMsg.show({ duration : 0 });
				}
			}
		}
  
        function gotohome(suiteletScriptId, suiteletDeploymentId){
            window.onbeforeunload= null;

            document.location = url.resolveScript({
                scriptId : suiteletScriptId,
                deploymentId : suiteletDeploymentId
            });
        }
        function refreshpage(){
            window.onbeforeunload= null;
            window.location.reload();
        }    
        function filtertransactions(){
            let currentRec=globalContext.currentRecord;       
            let account = currentRec.getValue({fieldId : 'custpage_main_account'});
            let cust = currentRec.getValue({fieldId : 'custpage_main_customer'  });
            let date = currentRec.getText({fieldId : 'custpage_main_date' });
            let duedate = currentRec.getText({fieldId : 'custpage_main_due_date' });
            let period = currentRec.getValue({fieldId : 'custpage_period' });
            let sub = currentRec.getValue({fieldId : 'custpage_main_subsidiary'});
            let ap_tratype = currentRec.getValue({ fieldId : 'custpage_main_ap_tratype' });
            let ar_tratype = currentRec.getValue({fieldId : 'custpage_main_ar_tratype' });
            ap_tratype=ap_tratype.toString();
            ar_tratype=ar_tratype.toString();

            if(cust){
              window.onbeforeunload= null;

                document.location = url.resolveScript({
                    scriptId : 'customscript_hzpc0041_sl_net_receivables',
                    deploymentId : 'customdeployhzpc0041_sl_net_receivables_',
                    params : {
                      'account':account,
                      'cust':cust,
                      'period':period,
                      'duedate':duedate,
                      'date':date,
                      'subsidiary':sub,
                      'ap_tratype':ap_tratype,
                      'ar_tratype':ar_tratype,
                      'action':'submit'
                    }
                });
            }else{
      			alert('Please select Grower');
            }
        }
        return {
            fieldChanged: fieldChanged,
            getSuiteletPage:getSuiteletPage,
            getParameterFromURL:getParameterFromURL,
            pageInit:pageInit,
            gotohome:gotohome,
            refreshpage:refreshpage,
            saveRecord:saveRecord,
            filtertransactions:filtertransactions
        };
    });
