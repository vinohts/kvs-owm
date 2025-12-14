import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class PrivateWebserverStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /* ============================================================
       1. Import existing VPC
       ============================================================ */

    const vpc = ec2.Vpc.fromLookup(this, 'ExistingVpc', {
      isDefault: false, // change only if you use default VPC
    });

    /* ============================================================
       2. Import existing PRIVATE subnet (NO AZ HARDCODING)
       ============================================================ */

    const privateSubnet = ec2.Subnet.fromSubnetId(
      this,
      'ExistingPrivateSubnet',
      'subnet-02ffaab75b54c2d5c'
    );

    /* ============================================================
       3. Security Group
       ============================================================ */

    const webSg = new ec2.SecurityGroup(this, 'WebSecurityGroup', {
      vpc,
      description: 'Security group for private web servers',
      allowAllOutbound: true,
    });

    // Example: allow HTTP from VPC CIDR
    webSg.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(80),
      'Allow HTTP from VPC'
    );

    /* ============================================================
       4. IAM Role for EC2
       ============================================================ */

    const webRole = new iam.Role(this, 'WebServerRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'IAM role for private web servers',
    });

    // Allow SSM Session Manager (recommended)
    webRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonSSMManagedInstanceCore'
      )
    );

    /* ============================================================
       5. AMI
       ============================================================ */

    const ami = ec2.MachineImage.latestAmazonLinux({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    });

    /* ============================================================
       6. EC2 Instances
       ============================================================ */

    new ec2.Instance(this, 'WebServer1', {
      vpc,
      vpcSubnets: {
        subnets: [privateSubnet],
      },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: webSg,
      role: webRole,
    });

    new ec2.Instance(this, 'WebServer2', {
      vpc,
      vpcSubnets: {
        subnets: [privateSubnet],
      },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: webSg,
      role: webRole,
    });
  }
}
