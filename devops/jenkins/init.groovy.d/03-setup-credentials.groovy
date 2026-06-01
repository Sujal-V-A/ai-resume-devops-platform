import jenkins.model.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*
import com.cloudbees.plugins.credentials.impl.*
import com.cloudbees.jenkins.plugins.sshcredentials.impl.*
import hudson.util.Secret

def domain = Domain.global()
def store = Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore()

// 1. Add SSH Key Credentials
def existingSsh = store.getCredentials(domain).find { it.id == "aws-ec2-ssh-key" }
if (existingSsh == null) {
    def privateKeyContent = """-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA1Fb/xabeupTArZRJ2d7WNIxzzEggX5xXCRfrFjLilwdwu6BD
EltnFNa/MSWDJ564+Z713xHtOUei1/TbtNH6/v1NGKHA7VV0+btqfolIIbUC3QOB
y/16iFaGbqHwpQAxwtINn5N5sCjmeZMCWHHPkpmZXS4VO07qSWACZ1/Xu6aGotSi
vjXJZ+GGnqGk5DIxbWrQL1dBBC4mi/hf1IyLPjgP2Nt+VDqisjCfIRMgp3xH09EQ
zWc0CHJHjJKhYxs5cJRsS/kk0JsP5QrrPIYcHeFrz9DM0XEES9gs+KhOIUhbKPbQ
A5ePXos+1Y3bSx0S2AgOKMM+oXSMg1RTPMlhOwIDAQABAoIBADWnhhm7gKxEyisS
PVcAJ8A/fUMxNnzyVEvH7288jGT9TE8cv9XzoqhxWv5gLDPmt3bb4+Tp8rd2kn9f
L+UQ6gtklgaTWNyfq18vLEmtBrz9sCuIp1OUSVIKCw4JfXU0B17jFO4tpaINs68k
poMSvxCcH1ScQGEsH6dKy1Cztx+DDlKmya3S4Usi8dEDgl93GaKFd6jYMCBrqwv5
HJpwn0Qx0T8hs8fvpKz2GAuoscZdMRsaVSpM5J3imIy7EKNELUc0W838r4p4gOuw
CTu6PcEwqB8vYdmXDKykFxFwIDvWJXCaQfreiHwBHrklWJ2Gfr6VnirCcF9IDiVJ
+hBk/oECgYEA/z+kftnwOpmaU0gxtpydTGdIsAE6zYESYWqBS+rturZjEg5J9K6h
2nRHlbGEOL1IpniEgwxK1m5UOzSX37PLlbwTozxlNYqSp0+D6Ef5N6VWmA6KP+gQ
45x4dUZdBuqJegShJb02IndI7cAzZgLnVIsRrryr0e7SoZSPVGcZMOUCgYEA1PcF
KMRq65cOHIVZnhgxUnK7EtmFrj8ndxl8YwHnItJD9tnbsg/mv2PVqq0im/6/Q3xE
I9Hl94ez1q4/EF2dDKZhFDeEJJbKJjs7fvCKBm1vuQtcy5kZSm3Q8X1AXobJP4XK
3aScPb7LLc1QSjMzFIt5BSLeXRatFoGQ0Op6x58CgYAjCnSlqXuuP8oM5ttUS3nY
tFEpQHH3JmIEl596cZ0DReih4O5MNfEoUVBGf6E8PNgNanwelYBsoabUneq/nioz
uycjALaQPB7X8zWTnNXcysjxhQV7snsnFCMBTpCU03veEWaiDLCy2JdddEZaGcny
NElQKLyZzGSEJCXtG1489QKBgHuyZwrA26GvgYDLa7xKLQvInCRcuCr3f8LLyNXx
GwG8w8Ez1UndtpdgM5EJM1sMYqeeHC36EurtpWWCnBqzZS8dzLFjdZuTAiOmr+4R
ZPpKwmPm16VibbAvjPdXWvYMsAP3gFew7xdmJLmb0ZDnoDnEsSxsjl/fdfXml+jg
6SPdAoGBAIZnTLRwe/cRwv3A904aihAeb4N/K9vaEx5rCH26Wc0R98lVX5Za3PLO
uZktzgaEvmT09oTCnJ+IUfvLN6XI/ShytRbylBhyXO9hXINwLY8Mqv+i0ttiBSzo
cmuIGfNBpHH40k1RVC2kY7zPDYg9mTeuuISFOCmaktz6H4TiGVxn
-----END RSA PRIVATE KEY-----"""

    def privateKey = new BasicSSHUserPrivateKey(
        CredentialsScope.GLOBAL,
        "aws-ec2-ssh-key",
        "ec2-user",
        new BasicSSHUserPrivateKey.DirectEntryPrivateKeySource(privateKeyContent),
        "",
        "AWS EC2 SSH Key"
    )
    store.addCredentials(domain, privateKey)
    println "=== SSH Credentials created successfully! ==="
}

// 2. Add Docker Hub Credentials
def existingDocker = store.getCredentials(domain).find { it.id == "docker-hub-credentials" }
if (existingDocker == null) {
    def dockerCreds = new UsernamePasswordCredentialsImpl(
        CredentialsScope.GLOBAL,
        "docker-hub-credentials",
        "Docker Hub credentials",
        "sujalainapure",
        "YOUR_DOCKER_HUB_PASSWORD_OR_TOKEN"
    )
    store.addCredentials(domain, dockerCreds)
    println "=== Docker Hub Credentials created successfully! ==="
}
