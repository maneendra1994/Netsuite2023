/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/render', 'N/file', 'N/search', 'N/record', 'N/encode'],

   function (render, file, search, record, encode) {

      /**
       * Definition of the Suitelet script trigger point.
       *
       * @param {Object} context
       * @param {ServerRequest} context.request - Encapsulation of the incoming request
       * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
       * @Since 2015.2
       */
      function onRequest(context) {
         try {
            var recId = context.request.parameters.recId;
            var projectId = context.request.parameters.projectId;
            var projId = '';
            if (projectId) {
               var projObj = search.lookupFields({
                  type: 'job',
                  id: projectId,
                  columns: ['entityid']
               });
               projId = projObj.entityid;
            }
            //log.debug('projId:',projId);
            var transactionFile = render.transaction({
               entityId: parseInt(recId),
               printMode: render.PrintMode.PDF,
               inCustLocale: false
            });
            var HTMLtransactionFile = render.transaction({
               entityId: parseInt(recId),
               printMode: render.PrintMode.HTML,
               inCustLocale: false
            });


            var currRec = record.load({
               id: recId,
               type: 'invoice'
            });
            var fromsub = currRec.getValue({
               fieldId: 'subsidiary'
            });
            var currency = currRec.getValue({
               fieldId: 'currency'
            });
            var transactionSearchObj = search.load({
               id: 'customsearch_hsbc_bank_details_search'
            });
            transactionSearchObj.filters.push(search.createFilter({
               name: 'custrecord157',
               operator: search.Operator.ANYOF,
               values: fromsub
            }));
            transactionSearchObj.filters.push(search.createFilter({
               name: 'custrecord158',
               operator: search.Operator.ANYOF,
               values: currency
            }));
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("customrecord_bank_detailsSearchObj result count", searchResultCount);
            var bankDetails;
            transactionSearchObj.run().each(function (result) {
               var internalId = result.id;
               if (result.getValue({
                     name: 'custrecord156'
                  }))
                  bankDetails = result.getValue({
                     name: 'custrecord156'
                  });
               return true;
            });
            log.debug('bankDetails', bankDetails);
            var text = HTMLtransactionFile.getContents();
            /* var text = encode.convert({
    string: transactionFile.getContents(),
    inputEncoding: encode.Encoding.BASE_64,
    outputEncoding: encode.Encoding.UTF_8
});*/

            log.debug('HTMLtransactionFile', text);
            var xmlStr = text.replace('bank', bankDetails);

            var reencoded = encode.convert({
               string: xmlStr,
               inputEncoding: encode.Encoding.UTF_8,
               outputEncoding: encode.Encoding.BASE_64
            });
            log.debug('reencoded', xmlStr);
            var transactionName = '';
            var tranName = transactionFile.name;
            tranName = tranName.toString().split('_');
            transactionName = tranName[1].split('.');
            transactionName = transactionName[0];
            var results = transactionSearchObj.run().getRange(0, 1000);

            /*  var renderer = render.create();
              renderer.templateContent = xmlStr;
              renderer.addSearchResults({
                  templateName: 'exampleName',
                  searchResult: results
              });

              var newfile = renderer.renderAsPdf();*/
            if (projId) {
               transactionName = transactionName + ' (' + projId + ')';
            }
            //  var invoicePdf = result.renderAsPdf();
            // log.debug('invoicePdf',invoicePdf);
            transactionName = transactionName + '.pdf';


            // var objRenderer = render.create();
            //objRenderer.templateContent = result.toString();

            //var objPdfFile = objRenderer.renderAsPdf();

            //log.debug('objRenderer',result);
            var fileObj = file.create({
               name: transactionName,
               fileType: file.Type.PDF,
               contents: reencoded, // transactionFile.getContents(),
               //folder:-15
            });
            log.debug('fileObj', fileObj.getContents())
            /*  context.response.setHeader({
						name: 'Content-Type',
						value: 'application/pdf'
					});*/


            if (transactionFile.size < 10485760) {
               context.response.writeFile({
                  file: fileObj
               });
               //context.response.writeFile( fileObj.getContents()	);
               /*(context.response.writeFile({
               	file :objPdfFile
               });*/
            }

         } catch (e) {
            log.error('e is:', e);
         }

      }

      return {
         onRequest: onRequest
      };

   });