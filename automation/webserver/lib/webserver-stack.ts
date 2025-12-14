import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class PrivateWebserverStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // -----------------------------
    // Import existing VPC
    // -----------------------------
    const vpc = ec2.Vpc.fromLookup(this, 'ExistingVPC', {
      vpcId: 'vpc-0207dfa8eb0021ea3',
    });

    // -----------------------------
    // Import existing PRIVATE subnet
    // -----------------------------
    const privateSubnet = ec2.Subnet.fromSubnetAttributes(
      this,
      'ExistingPrivateSubnet',
      {
        subnetId: 'subnet-02ffaab75b54c2d5c',
        availabilityZone: 'ap-south-1b',
        routeTableId: 'rtb-0025344da5954e3ab',
      }
    );

    // -----------------------------
    // Security Group (HTTP only)
    // -----------------------------
    const webSg = new ec2.SecurityGroup(this, 'WebSecurityGroup', {
      vpc,
      description: 'Allow HTTP access',
      allowAllOutbound: true,
    });

    webSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP'
    );

    // -----------------------------
    // User data (Apache)
    // -----------------------------
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'yum update -y',
      'yum install -y httpd',
      'systemctl enable httpd',
      'systemctl start httpd'
    );

    // -----------------------------
    // EC2 instances (2 servers)
    // -----------------------------
    for (let i = 1; i <= 2; i++) {
      new ec2.Instance(this, `WebServer${i}`, {
        vpc,
        instanceType: new ec2.InstanceType('t3.micro'),
        machineImage: ec2.MachineImage.latestAmazonLinux2(),
        vpcSubnets: {
          subnets: [privateSubnet],
        },
        securityGroup: webSg,
        associatePublicIpAddress: false,
        userData,
      });
    }
  }
}
