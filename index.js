  
var commands = require('probot-commands');
module.exports = app => {
  // Your code here //gfg
  app.log("Yay! The app was loaded!");
  // example of probot responding 'Hello World' to a new issue being opened
  app.on("issues.opened", async context => {
    const params = context.issue({ body: "Hello World!" });
    return context.github.issues.createComment(params);
  });
  app.on("issue_comment.created", async context => { //gfg
    commands(app, "lm", (context, command) => {
      const labelvals = command.arguments.split(/, */);
      // var labelipjson = JSON.stringify(labelvals);
      var label_len = labelvals.length;
      context.log('label_len ' + label_len);
      var labels = labelvals.slice(1, label_len);
      
      context.log(labels); //gfg

      if (labelvals[0] == "add") {
        // var labels = labelvals.slice(1, label_len);
        context.log(labels);
        return context.github.issues.addLabels(context.issue({ labels }));
      } 
      else if (labelvals[0] == "remove") {
      for (var i = 0; i < label_len; i++) {
        // context.log(labels);
        return context.github.issues.removeLabel(
          context.issue({ name: labels[i] })
        );
      }
      }else { //gfg
        var params = context.issue({
          body:
            "improper command. follow the syntax: /lm [add/remove] label1 label2 label3"
        });
        return context.github.issues.createcomment(params);
      }
    });
  });
};
