/**
 * Standar formatted json renderer
 * @author Juniawan
 * @version 1.0.0
 * @since 1.0.0
 */
class JsonRenderer{
  /**
   * @since 1.0.0
   * @constructor
   * @param {object} res - Response object
   */
  constructor(res){
    this.success = true;
    this.message = "";
    this.res = res;
    this.data = null;
    this.status = 200;
  }

  /**
   * Set response status
   * @since 1.0
   * @param {number} status - HTTP response code
   * @returns {object} - JsonRenderer for chaining method
   */
  setStatus(status){
    this.status = status;
    return this;
  }

  /**
   * Set response status to 404 - not found
   * @since 1.0.0
   * @returns {object} - JsonRenderer for chaining method
   */
  setStatusNotFound(){
    this.setStatus(404).setSuccessFalse()
    return this;
  }

  /**
   * Set response status to 500 - error
   * @since 1.0.0
   * @returns {object} - JsonRenderer for chaining method
   */
  setStatusError(){
    this.setStatus(500).setSuccessFalse()
    return this
  }

  /**
   * Set response status to 403 - forbidden
   * @since 1.0.0
   * @returns {object} - JsonRenderer for chaining method
   */
  setStatusForbidden(){
    this.setStatus(403).setSuccessFalse()
    return this
  }

  /**
   * Set data to send to response
   * @since 1.0.0
   * @param {*} data - Data to send to response
   * @returns {object} - JsonRenderer for chaining method
   */
  setData(data){
    if(data){
      this.data = data
    }
    return this;
  }
  
  /**
   * Append data to data object
   * @since 1.0.0
   * @param {object} data
   * @returns {object} - JsonRenderer for chaining method
   */
  appendData(data){
    this.data = {...this.data, data};
    return this;
  }
  
  /**
   * Reset data object
   * @since 1.0.0
   * @returns {object} - JsonRenderer for chaining method
   */
  resetData(){
    this.data = null;
    return this;
  }
  
  /**
   * Set status response data
   * @since 1.0.0
   * @param {boolean} success
   * @returns {object} - JsonRenderer for chaining method 
   */
  setSuccess(success){
    this.success = success
    return this;
  }
  
  /**
   * Set success response data to true
   * @since 1.0.0
   * @returns {object} - JsonRenderer for chaining method
   */
  setSuccessTrue(){
    this.success = true;
    return this;
  }
  
  /**
   * Set success response data to false
   * @since 1.0.0
   * @returns {object} - JsonRenderer for chaining method
   */
  setSuccessFalse(){
    this.success = false;
    return this;
  }
  
  /**
   * Set message response data
   * @since 1.0.0
   * @param {string} message 
   * @returns {object} - JsonRenderer for chaining method
   */
  setMessage(message){
    if(message){
      this.message = message
    }
    return this;
  }
  
  /**
   * Reset message data
   * @since 1.0.0
   * @returns {object} - JsonRenderer for chaining method
   */
  resetMessage(){
    this.message = "";
    return this;
  }

  /**
   * Send output response as json
   * @since 1.0.0
   */
  render(){
    let res = {success: this.success, status: this.status}
    if(this.message){
      res.message = this.message
    }

    if(this.messages.length>0){
      res.messages = this.messages
    }

    if(this.success && this.data){
      res.data = this.data
    }
    if(this.success && this.meta instanceof Object && Object.keys(this.meta).length > 0){
      res.meta = this.meta
    }
    if(this.success && this.id){
      res.id = this.id
    }

    if(Object.keys(this.customKey).length>0){
      Object.keys(this.customKey).map(key => {
        res[key] = this.customKey[key];
      })
    }
    process.traceLog('info', "Response JSON sent", __filename, __linenumber, process.scene, res);
    this.res.status(this.status).json(res);
  }

  /**
   * Send not found response
   * @since 1.0.0
   * @param {string} [message] - Not found response message
   */
  renderNotFound(message){
    if(!message) message = __trans("notifications.not-found", "Request");
    this.setStatusNotFound().setMessage(message).render()
  }

  /**
   * Send error response
   * @param {string} [message] - Error response message
   */
  renderError(message){
    if(!message){message = __trans("notifications.system-error");}
    this.setStatusError().setMessage(message).render()
  }

  /**
   * Send forbidden access message
   * @param {string} [message] - Forbidden response message
   */
  renderForbidden(message){
    if(!message){message = __trans("notifications.not-allowed");}
    this.setStatusForbidden().setMessage(message).render();
  }

  /**
   * Send failed response message
   * @param {string} message - Failed response message
   */
  renderFailed(message){
    if(!message){message = __trans("notifications.data-invalid", "Input");}
    this.setSuccessFalse().setMessage(message).render();
  }

  /**
   * Send success response message
   * @param {string} message - Success response message
   */
  renderSuccess(message){
    this.setSuccessTrue().setMessage(message).render();
  }

  /**
   * Enterprate response from rpc
   * @param {object} rpcResponse 
   */
  renderRpcResponse(rpcResponse){
    if(rpcResponse.status){
      this.setStatus(rpcResponse.status);
    }
    if(rpcResponse.data){
      this.setData(rpcResponse.data);
    }
    if(rpcResponse.success){
      this.renderSuccess();
    }else{
      this.renderFailed(rpcResponse.message);
    }
  }
}

module.exports = res => {
  res.jsonRenderer = new JsonRenderer(res);
};