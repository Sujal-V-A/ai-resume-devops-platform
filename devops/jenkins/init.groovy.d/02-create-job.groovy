import jenkins.model.*
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import hudson.plugins.git.GitSCM
import hudson.plugins.git.BranchSpec
import hudson.plugins.git.UserRemoteConfig

def jobName = "ai-resume-pipeline"
def gitUrl = "https://github.com/Sujal-V-A/ai-resume-devops-platform.git"

def instance = Jenkins.getInstance()
if (instance.getItem(jobName) == null) {
    def job = instance.createProject(WorkflowJob.class, jobName)
    def userRemoteConfig = new UserRemoteConfig(gitUrl, null, null, null)
    def scm = new GitSCM([userRemoteConfig], [new BranchSpec("*/main")], false, [], null, null, [])
    def flowDefinition = new CpsScmFlowDefinition(scm, "devops/jenkins/Jenkinsfile")
    flowDefinition.setLightweight(true)
    job.setDefinition(flowDefinition)
    job.save()
    println "=== Pipeline Job created successfully! ==="
}
