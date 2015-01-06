var router = require('express').Router();
var ProxyingAgent = require('proxying-agent').ProxyingAgent;
var createProxyServer = require('http-proxy').createProxyServer;

module.exports = function(options) {
    var 
      agentOptions = options.agentOptions || {},
      hasAgentOptions = options.hasOwnProperty('agentOptions'),
      proxyingAgent = hasAgentOptions && (new ProxyingAgent(options.agentOptions)),
      proxies = {};

    if (options.proxies) {
        Object.keys(options.proxies).forEach(function(index) {
            var
              proxy = createProxyServer({}),
              proxyConf = options.proxies[index],
              proxyOptions = {
                  target: proxyConf.target
              },
              isChained =  hasAgentOptions && proxyConf.hasOwnProperty('chained') && proxyConf.chained;
            proxyOptions.agent = isChained && proxyingAgent;
            proxies[proxyConf.prefix] = proxyOptions;

            router.all(proxyConf.prefix + '/*', function(req, res) {
                req.url = req.url.replace(proxyConf.prefix, '');
                proxy.web(req, res, proxies[proxyConf.prefix]);
            });
        });
    }

    return router;

};
