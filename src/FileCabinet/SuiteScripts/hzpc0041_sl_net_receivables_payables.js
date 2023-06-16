/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record','../library/hzpc0041_cm_tran_model'],
    (record, tranModel) => {
        const onRequest = (scriptContext) => {
            const functionName = "onRequest";
            try{
               let objRequest = scriptContext.request;
               let reqMethod = objRequest.method;
               switch(reqMethod){
                   case "GET" :
                       tranModel.handleGetOperation(scriptContext);
                       break;
                   case "POST" :
                       tranModel.handlePostOperation(scriptContext);
               }
            }
            catch (ex) {
                let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
                log.error('Error',
                    `A problem occured whilst : <br>${errorStr}<br>functionName>>>>${functionName}`);

            }
        }
        return {onRequest}
    });
