import jenkins.model.*
import hudson.security.*
import jenkins.install.*

def instance = Jenkins.getInstance()

// Disable Setup Wizard
instance.setInstallState(InstallState.INITIAL_SETUP_COMPLETED)

// Create admin account
def realm = new HudsonPrivateSecurityRealm(false)
realm.createAccount("admin", "admin123")
realm.createAccount("sujalainapure", "admin123")
instance.setSecurityRealm(realm)

def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
instance.setAuthorizationStrategy(strategy)
instance.save()
println "=== Admin account created successfully! ==="
