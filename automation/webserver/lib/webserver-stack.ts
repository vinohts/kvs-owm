import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class WebserverStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import existing VPC
    const vpc = ec2.Vpc.fromLookup(this, 'ExistingVPC', {
      vpcId: 'vpc-0207dfa8eb0021ea3',
    });

    // Import existing private subnet
   const subnet = ec2.Subnet.fromSubnetAttributes(this, 'ExistingSubnet', {
  subnetId: 'subnet-02ffaab75b54c2d5',
  availabilityZone: 'ap-south-1a'  // Replace with your subnet's AZ
});
    // Security Group
    const webSg = new ec2.SecurityGroup(this, 'WebSecurityGroup', {
      vpc,
      description: 'Allow HTTP access',
      allowAllOutbound: true,
    });

    webSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );

    // User data to install Apache
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'yum update -y',
      'yum install -y httpd',
      'systemctl enable httpd',
      'systemctl start httpd'
    );

    // Create 2 private EC2 instances
    for (let i = 1; i <= 2; i++) {
      new ec2.Instance(this, `WebServer${i}`, {
        vpc,
        vpcSubnets: { subnets: [subnet] },
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux2(),
        securityGroup: webSg,
        userData,
        associatePublicIpAddress: false, // NO public IP
      });
    }
  }
}
