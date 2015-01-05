module.exports = {
    init: function(dara){
        
        this.speak = function(){
            return "Hello world!";
        };
        
        dara.mix(this);
    }
}
