<style>
    html, body {
    	width: 100%;
    	height: 100%;
        padding: 0;
        margin: 0;
        background: #FAFAFA;
    }
    #app {
        width: 360px;
    }
</style>
<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
<script>
    /* 设置浏览器逻辑宽度的像素为定值  */
    (function(document, window, width) {
        var scale = window.screen.width / width,
            viewPort = '<meta name = "viewport" content = "';
        viewPort += 'target-densitydpi = device-dpi, width = ' + width + ', initial-scale = ' + scale;
        viewPort += ',minimum-scale = ' + scale + ', maximum-scale = ' + scale + ', user-scalable = no';
        document.write(viewPort + '">');
    })(document, window, 360);
    export default{
    	computed: {
	      direction () {
	        const viewDir = this.$store.state.viewDirection
	        let tranName = ''
	
	        if (viewDir === 'left') {
	          tranName = 'view-out'
	        } else if (viewDir === 'right') {
	          tranName = 'view-in'
	        } else {
	          tranName = 'fade'
	        }
	
	        return tranName
	      }
	    }
    }
    
</script>